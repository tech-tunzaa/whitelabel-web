"use client";

import { useState } from "react";
import { Check, Copy, Mail, User, KeyRound } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NewUserCredentialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userData: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
    };
}

export function NewUserCredentialsDialog({
    open,
    onOpenChange,
    userData,
}: NewUserCredentialsDialogProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success(`${field} copied to clipboard`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => copyToClipboard(text, field)}
        >
            {copiedField === field ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy {field}</span>
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        User Created Successfully
                    </DialogTitle>
                    <DialogDescription>
                        The user account has been created. Below are the login credentials.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert>
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                            These credentials have been sent to the user via email. The user can log in using these details.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="name"
                                    value={`${userData.first_name} ${userData.last_name}`}
                                    readOnly
                                    className="flex-1"
                                />
                                <CopyButton
                                    text={`${userData.first_name} ${userData.last_name}`}
                                    field="Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="email"
                                    value={userData.email}
                                    readOnly
                                    className="flex-1"
                                />
                                <CopyButton text={userData.email} field="Email" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" />
                                Temporary Password
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="password"
                                    value={userData.password}
                                    readOnly
                                    className="flex-1 font-mono"
                                />
                                <CopyButton text={userData.password} field="Password" />
                            </div>
                        </div>
                    </div>

                    <Alert variant="default" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <AlertDescription className="text-sm">
                            <strong>Note:</strong> Please share these credentials securely with the user if needed.
                            The user should change their password after first login.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
