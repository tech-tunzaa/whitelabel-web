import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentWithMeta } from '@/components/ui/document-upload';
import { UploadResponse, uploadDocument } from '@/lib/services/document-upload.service';

export interface DocumentWithUpload extends DocumentWithMeta {
    uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
    progress?: number;
    uploadResponse?: UploadResponse;
    error?: string;
}

interface DocumentState {
    // Documents keyed by form identifier to support multiple forms
    documents: Record<string, DocumentWithUpload[]>;
    uploadingDocuments: Record<string, boolean>;
    // Track active forms to clean up when component unmounts
    activeForms: Set<string>;

    // Actions
    addDocument: (formId: string, doc: DocumentWithUpload) => void;
    updateDocument: (formId: string, fileName: string, updates: Partial<DocumentWithUpload>) => void;
    removeDocument: (formId: string, fileName: string) => void;
    setDocuments: (formId: string, docs: DocumentWithUpload[]) => void;
    clearDocuments: (formId?: string) => void;

    // Form lifecycle management
    registerForm: (formId: string) => void;
    unregisterForm: (formId: string) => void;

    // Upload functions
    uploadDocument: (formId: string, doc: DocumentWithUpload, isPublic?: boolean) => Promise<DocumentWithUpload>;
    retryUpload: (formId: string, fileName: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>()(
    persist(
        (set, get) => ({
            documents: {},
            uploadingDocuments: {},
            activeForms: new Set<string>(),

            addDocument: (formId, doc) => {
                // Register form if not already registered
                get().registerForm(formId);

                set((state) => {
                    const formDocs = state.documents[formId] || [];

                    // Check if document already exists
                    const existingIndex = formDocs.findIndex(
                        existingDoc => existingDoc.file_name === doc.file_name
                    );

                    if (existingIndex >= 0) {
                        // Update existing document
                        const updatedDocs = [...formDocs];
                        updatedDocs[existingIndex] = { ...updatedDocs[existingIndex], ...doc };

                        return {
                            documents: {
                                ...state.documents,
                                [formId]: updatedDocs
                            }
                        };
                    } else {
                        // Add new document
                        return {
                            documents: {
                                ...state.documents,
                                [formId]: [...formDocs, doc]
                            }
                        };
                    }
                });
            },

            updateDocument: (formId, fileName, updates) => {
                set((state) => {
                    const formDocs = state.documents[formId] || [];
                    const updatedDocs = formDocs.map(doc =>
                        doc.file_name === fileName ? { ...doc, ...updates } : doc
                    );

                    return {
                        documents: { ...state.documents, [formId]: updatedDocs }
                    };
                });
            },

            removeDocument: (formId, fileName) => {
                set((state) => {
                    const formDocs = state.documents[formId] || [];
                    const updatedDocs = formDocs.filter(doc => doc.file_name !== fileName);

                    return {
                        documents: { ...state.documents, [formId]: updatedDocs },
                        uploadingDocuments: {
                            ...state.uploadingDocuments,
                            [`${formId}-${fileName}`]: false
                        }
                    };
                });
            },

            setDocuments: (formId, docs) => {
                // Register form if not already registered
                get().registerForm(formId);

                set((state) => ({
                    documents: { ...state.documents, [formId]: docs }
                }));
            },

            clearDocuments: (formId) => {
                if (formId) {
                    set((state) => ({
                        documents: { ...state.documents, [formId]: [] },
                        uploadingDocuments: Object.entries(state.uploadingDocuments)
                            .filter(([key]) => !key.startsWith(`${formId}-`))
                            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
                    }));
                } else {
                    set({ documents: {}, uploadingDocuments: {} });
                }
            },

            registerForm: (formId) => {
                set((state) => {
                    const newActiveForms = new Set(state.activeForms);
                    newActiveForms.add(formId);
                    return { activeForms: newActiveForms };
                });
            },

            unregisterForm: (formId) => {
                set((state) => {
                    // Clean up documents for this form
                    const updatedDocs = { ...state.documents };
                    delete updatedDocs[formId];

                    // Clean up uploading state
                    const updatedUploading = { ...state.uploadingDocuments };
                    Object.keys(updatedUploading).forEach(key => {
                        if (key.startsWith(`${formId}-`)) {
                            delete updatedUploading[key];
                        }
                    });

                    // Remove from active forms
                    const newActiveForms = new Set(state.activeForms);
                    newActiveForms.delete(formId);

                    return {
                        documents: updatedDocs,
                        uploadingDocuments: updatedUploading,
                        activeForms: newActiveForms
                    };
                });
            },

            uploadDocument: async (formId, doc, isPublic = true) => {
                // Skip if no file or already uploading
                if (!doc.file || get().uploadingDocuments[`${formId}-${doc.file_name}`]) {
                    return doc;
                }

                // Mark as uploading
                set((state) => ({
                    uploadingDocuments: {
                        ...state.uploadingDocuments,
                        [`${formId}-${doc.file_name}`]: true
                    },
                    documents: {
                        ...state.documents,
                        [formId]: (state.documents[formId] || []).map(d =>
                            d.file_name === doc.file_name
                                ? { ...d, uploadStatus: 'uploading', progress: 0, error: undefined }
                                : d
                        )
                    }
                }));

                try {
                    // Upload the file
                    const response = await uploadDocument(doc.file, isPublic);

                    // Update document with upload response
                    const updatedDoc = {
                        ...doc,
                        document_url: response.fileCDNUrl,
                        file_url: response.fileCDNUrl,
                        file_size: response.fileSize,
                        mime_type: response.mimeType,
                        uploadStatus: 'success',
                        progress: 100,
                        uploadResponse: response,
                        error: undefined
                    } as DocumentWithUpload;

                    // Update in store
                    set((state) => ({
                        documents: {
                            ...state.documents,
                            [formId]: (state.documents[formId] || []).map(d =>
                                d.file_name === doc.file_name ? updatedDoc : d
                            )
                        }
                    }));

                    return updatedDoc;
                } catch (error: any) {
                    // Update document with error status
                    const errorMessage = error?.message || 'Upload failed';
                    set((state) => ({
                        documents: {
                            ...state.documents,
                            [formId]: (state.documents[formId] || []).map(d =>
                                d.file_name === doc.file_name
                                    ? { ...d, uploadStatus: 'error', error: errorMessage }
                                    : d
                            )
                        }
                    }));

                    return {
                        ...doc,
                        uploadStatus: 'error',
                        error: errorMessage
                    } as DocumentWithUpload;
                } finally {
                    // Clear uploading flag
                    set((state) => ({
                        uploadingDocuments: {
                            ...state.uploadingDocuments,
                            [`${formId}-${doc.file_name}`]: false
                        }
                    }));
                }
            },

            retryUpload: async (formId, fileName) => {
                const doc = get().documents[formId]?.find(d => d.file_name === fileName);
                if (doc && doc.file) {
                    await get().uploadDocument(formId, doc);
                }
            }
        }),
        {
            name: 'document-storage',
            partialize: (state) => ({
                // Only persist documents that have been successfully uploaded
                documents: Object.entries(state.documents).reduce((acc, [formId, docs]) => {
                    // Only include documents from active forms that have completed uploads
                    if (state.activeForms.has(formId)) {
                        acc[formId] = docs.filter(doc => doc.uploadStatus === 'success');
                    }
                    return acc;
                }, {} as Record<string, DocumentWithUpload[]>)
            })
        }
    )
); 