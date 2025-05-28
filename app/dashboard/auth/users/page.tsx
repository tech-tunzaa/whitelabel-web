"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { useUserStore } from "@/features/auth/stores/user-store"
import { User } from "@/features/auth/types/user"
import { UserTable } from "@/features/auth/components/user-table"
import { UserDetailsDialog } from "@/features/auth/components/user-details-dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function UsersPage() {
  const router = useRouter()
  const {
    users,
    loading,
    storeError,
    selectedUser,
    selectUser,
    setSearchQuery,
    setSelectedStatus,
    getFilteredUsers,
    fetchUsers,
    changeUserStatus
  } = useUserStore()
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers()
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }
    
    loadUsers()
  }, [fetchUsers])
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Handle status filter
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as 'all' | 'active' | 'inactive')
  }
  
  // Handle user selection
  const handleUserClick = (user: User) => {
    selectUser(user)
    setIsDetailsOpen(true)
  }
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDetailsOpen(false)
  }
  
  // Handle user activation/deactivation
  const handleActivateUser = async (id: string) => {
    try {
      await changeUserStatus(id, 'active')
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }
  
  const handleDeactivateUser = async (id: string) => {
    try {
      await changeUserStatus(id, 'inactive')
    } catch (error) {
      console.error('Failed to deactivate user:', error)
    }
  }
  
  // Navigate to edit user page
  const handleEditUser = (id: string) => {
    router.push(`/dashboard/auth/users/${id}/edit`)
    setIsDetailsOpen(false)
  }
  
  // Navigate to add user page
  const handleAddUser = () => {
    router.push('/dashboard/auth/users/add')
  }
  
  // Get filtered users
  const filteredUsers = getFilteredUsers()
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mx-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts
          </p>
        </div>
        
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <Separator />

      <div className="relative w-full md:w-auto mx-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-8 w-full md:w-[300px]"
          onChange={handleSearch}
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mx-4">
        <Tabs defaultValue="all" className="flex-1" onValueChange={handleStatusChange}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="all">
              All Users
              <Badge variant="outline" className="ml-2">{users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active">
              Active
              <Badge variant="outline" className="ml-2">
                {users.filter(user => user.is_active).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive
              <Badge variant="outline" className="ml-2">
                {users.filter(user => !user.is_active).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : storeError ? (
        <div className="text-center py-8 text-destructive">
          <p>Error loading users: {storeError.message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => fetchUsers()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onUserClick={handleUserClick}
          onActivateUser={handleActivateUser}
          onDeactivateUser={handleDeactivateUser}
          onEditUser={handleEditUser}
        />
      )}
      
      <UserDetailsDialog
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={handleCloseDialog}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
        onEdit={handleEditUser}
      />
    </div>
  )
}
