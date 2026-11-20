// src/app/(dashboard)/expenses/ExpenseSheet.tsx
"use client"
import React, { useState, useEffect, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from '@/components/ui/use-toast'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { createExpense, updateExpense, deleteExpense } from '@/lib/features/expense/expenseSlice'
import { 
  selectSplitwiseConnection,
  selectSplitwiseGroups,
  selectSplitwiseFriends,
  selectSplitwiseGroupsStatus,
  selectSplitwiseFriendsStatus,
  checkSplitwiseConnection,
  fetchSplitwiseGroups,
  fetchSplitwiseFriends
} from '@/lib/features/splitwise/splitwiseSlice'
import { Expense, ExpenseSource, FinanceAccount, CreateExpenseInput } from '@/lib/types'
import { 
  Trash2, 
  Loader2, 
  Users, 
  User, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface ExpenseSheetProps {
  expenseSourceData: ExpenseSource[]
  accountData: FinanceAccount[]
  isOpen: boolean
  onClose: () => void
  expenseToEdit?: Expense | null
}

export default function ExpenseSheet({
  expenseSourceData,
  accountData,
  isOpen,
  onClose,
  expenseToEdit
}: ExpenseSheetProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // Base Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: '',
    accountId: '',
    expenseSourceId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Splitwise Integration State
  const isSplitwiseConnected = useAppSelector(selectSplitwiseConnection)
  const splitwiseGroups = useAppSelector(selectSplitwiseGroups)
  const splitwiseFriends = useAppSelector(selectSplitwiseFriends)
  const groupsStatus = useAppSelector(selectSplitwiseGroupsStatus)
  const friendsStatus = useAppSelector(selectSplitwiseFriendsStatus)

  const [isSplitwiseEnabled, setIsSplitwiseEnabled] = useState(false)
  const [splitType, setSplitType] = useState<'group' | 'friends'>('group')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const [splitEqually, setSplitEqually] = useState<boolean>(true)
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [customUserShare, setCustomUserShare] = useState<string>('')

  // Check connection & fetch groups/friends when sheet opens
  useEffect(() => {
    if (isOpen) {
      dispatch(checkSplitwiseConnection())
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    if (isOpen && isSplitwiseEnabled && isSplitwiseConnected) {
      if (groupsStatus === 'idle') {
        dispatch(fetchSplitwiseGroups())
      }
      if (friendsStatus === 'idle') {
        dispatch(fetchSplitwiseFriends())
      }
    }
  }, [isOpen, isSplitwiseEnabled, isSplitwiseConnected, groupsStatus, friendsStatus, dispatch])

  // Reset or initialize form data
  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setFormData({
          name: expenseToEdit.name,
          amount: expenseToEdit.amount.toString(),
          date: new Date(expenseToEdit.date).toISOString().split('T')[0],
          accountId: expenseToEdit.accountId,
          expenseSourceId: expenseToEdit.expenseSourceId || ''
        })
        setIsSplitwiseEnabled(!!expenseToEdit.isSplitwiseLinked)
      } else {
        setFormData({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          accountId: accountData[0]?.accountId || '',
          expenseSourceId: ''
        })
        setIsSplitwiseEnabled(false)
        setSelectedGroupId('')
        setSelectedFriendIds([])
        setSplitEqually(true)
        setCustomUserShare('')
      }
    }
  }, [isOpen, expenseToEdit, accountData])

  // Auto-select first group when groups are fetched
  useEffect(() => {
    if (splitwiseGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(splitwiseGroups[0].id)
    }
  }, [splitwiseGroups, selectedGroupId])

  // Selected Group details
  const activeGroup = useMemo(() => {
    return splitwiseGroups.find(g => g.id === selectedGroupId)
  }, [splitwiseGroups, selectedGroupId])

  // Filtered friends list for search
  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return splitwiseFriends
    return splitwiseFriends.filter(f => 
      f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
      (f.email && f.email.toLowerCase().includes(friendSearchQuery.toLowerCase()))
    )
  }, [splitwiseFriends, friendSearchQuery])

  // Calculation of shares for live preview
  const calculation = useMemo(() => {
    const total = parseFloat(formData.amount) || 0
    if (total <= 0) return { userShare: 0, iouAmount: 0, perPerson: 0, peopleCount: 1 }

    if (splitType === 'group') {
      const memberCount = Math.max(activeGroup?.members.length || 1, 1)
      if (splitEqually) {
        const perPerson = total / memberCount
        const userShare = Math.round(perPerson * 100) / 100
        const iouAmount = Math.max(0, total - userShare)
        return { userShare, iouAmount, perPerson, peopleCount: memberCount }
      } else {
        const uShare = parseFloat(customUserShare) || total
        const userShare = Math.min(Math.max(uShare, 0), total)
        const iouAmount = Math.max(0, total - userShare)
        return { userShare, iouAmount, perPerson: userShare, peopleCount: memberCount }
      }
    } else {
      // Friends split
      const totalPeople = 1 + selectedFriendIds.length
      if (splitEqually) {
        const perPerson = total / totalPeople
        const userShare = Math.round(perPerson * 100) / 100
        const iouAmount = Math.max(0, total - userShare)
        return { userShare, iouAmount, perPerson, peopleCount: totalPeople }
      } else {
        const uShare = parseFloat(customUserShare) || total
        const userShare = Math.min(Math.max(uShare, 0), total)
        const iouAmount = Math.max(0, total - userShare)
        return { userShare, iouAmount, perPerson: userShare, peopleCount: totalPeople }
      }
    }
  }, [formData.amount, splitType, activeGroup, splitEqually, selectedFriendIds, customUserShare])

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendIds(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const parsedAmount = parseFloat(formData.amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Amount",
          description: "Please enter a valid expense amount greater than 0.",
        })
        setIsLoading(false)
        return
      }

      if (!formData.accountId) {
        toast({
          variant: "destructive",
          title: "Missing Account",
          description: "Please select an account for this transaction.",
        })
        setIsLoading(false)
        return
      }

      // Validate Splitwise options if enabled
      if (isSplitwiseEnabled && !expenseToEdit) {
        if (!isSplitwiseConnected) {
          toast({
            variant: "destructive",
            title: "Splitwise Not Connected",
            description: "Please connect your Splitwise account before splitting expenses.",
          })
          setIsLoading(false)
          return
        }

        if (splitType === 'group' && !selectedGroupId) {
          toast({
            variant: "destructive",
            title: "Group Required",
            description: "Please select a Splitwise group to split with.",
          })
          setIsLoading(false)
          return
        }

        if (splitType === 'friends' && selectedFriendIds.length === 0) {
          toast({
            variant: "destructive",
            title: "Friends Required",
            description: "Please select at least one friend to split this expense with.",
          })
          setIsLoading(false)
          return
        }
      }

      const expenseData: CreateExpenseInput = {
        name: formData.name,
        amount: parsedAmount,
        date: new Date(formData.date).toISOString(),
        accountId: formData.accountId,
        expenseSourceId: formData.expenseSourceId === 'none' ? undefined : formData.expenseSourceId,
        ...(isSplitwiseEnabled && !expenseToEdit && isSplitwiseConnected ? {
          splitwise: {
            enabled: true,
            splitType,
            groupId: splitType === 'group' ? selectedGroupId : undefined,
            groupName: splitType === 'group' ? activeGroup?.name : undefined,
            friendIds: splitType === 'friends' ? selectedFriendIds : undefined,
            splitEqually,
            userShare: splitEqually ? undefined : calculation.userShare,
            friendShares: splitEqually ? undefined : (
              splitType === 'friends' && selectedFriendIds.length > 0 
                ? { [selectedFriendIds[0]]: calculation.iouAmount }
                : undefined
            )
          }
        } : {})
      }

      if (expenseToEdit) {
        await dispatch(updateExpense({
          expenseId: expenseToEdit.expenseId,
          ...expenseData
        })).unwrap()
        toast({
          title: "Expense Updated",
          description: `Updated "${formData.name}".`
        })
      } else {
        await dispatch(createExpense(expenseData)).unwrap()
        toast({
          title: isSplitwiseEnabled ? "Expense Created & Split on Splitwise!" : "Expense Created",
          description: isSplitwiseEnabled 
            ? `Your share: ₹${calculation.userShare.toFixed(2)} • Friend IOU: +₹${calculation.iouAmount.toFixed(2)}`
            : `Expense of ₹${parsedAmount.toFixed(2)} created successfully.`
        })
      }

      onClose()
    } catch (error: any) {
      console.error('Submit expense error:', error)
      const errorMsg = error?.response?.data?.error || error?.message || `Failed to ${expenseToEdit ? 'update' : 'create'} expense`
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!expenseToEdit) return

    setIsDeleting(true)
    try {
      await dispatch(deleteExpense(expenseToEdit.expenseId)).unwrap()
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed."
      })
      onClose()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-700 text-white sm:max-w-lg overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle className="text-white text-xl flex items-center gap-2">
            {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
            {isSplitwiseEnabled && (
              <Badge className="bg-green-600/30 text-green-300 border border-green-500/50 text-[11px] font-normal">
                Splitwise
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {expenseToEdit ? 'Update your expense details' : 'Record a new expense and optionally split it directly on Splitwise'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6 pb-12">
          {/* Expense Name */}
          <div>
            <Label htmlFor="name" className="text-white font-medium">Expense Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Dinner at Social, Groceries, Uber"
              required
              className="bg-gray-800 border-gray-600 text-white mt-1.5 focus:border-blue-500"
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="text-white font-medium">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                required
                className="bg-gray-800 border-gray-600 text-white mt-1.5 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-white font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="bg-gray-800 border-gray-600 text-white mt-1.5 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <Label htmlFor="account" className="text-white font-medium">Payment Account</Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => setFormData({...formData, accountId: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1.5">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                {accountData.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    {account.name} (₹{account.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div>
            <Label htmlFor="source" className="text-white font-medium">Category (Optional)</Label>
            <Select
              value={formData.expenseSourceId}
              onValueChange={(value) => setFormData({...formData, expenseSourceId: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectItem value="none">
                  <span className="text-gray-400 italic">No category</span>
                </SelectItem>
                {expenseSourceData.map((source) => (
                  <SelectItem key={source.expenseSourceId} value={source.expenseSourceId}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ======================================================== */}
          {/* SPLITWISE INTEGRATION SECTION */}
          {/* ======================================================== */}
          {!expenseToEdit ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800/80 p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-base border border-green-500/30">
                    S
                  </div>
                  <div>
                    <Label htmlFor="splitwise-toggle" className="text-white font-semibold cursor-pointer text-sm">
                      Split on Splitwise
                    </Label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Automatically record & split this bill with friends
                    </p>
                  </div>
                </div>
                <Switch
                  id="splitwise-toggle"
                  checked={isSplitwiseEnabled}
                  onCheckedChange={(checked) => setIsSplitwiseEnabled(checked)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Expanded Splitwise Controls */}
              {isSplitwiseEnabled && (
                <div className="pt-2 space-y-4 border-t border-gray-700/80">
                  {!isSplitwiseConnected ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-200">Splitwise Account Not Connected</p>
                          <p className="text-xs text-amber-200/80 mt-1">
                            Link your Splitwise account once to split expenses directly from this app.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/splitwise', '_blank')}
                        className="w-full border-amber-500/40 text-amber-200 hover:bg-amber-500/20 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Connect Splitwise
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Split Type Selector: Group vs Friends */}
                      <div>
                        <Label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Split With
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => setSplitType('group')}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all border ${
                              splitType === 'group'
                                ? 'bg-green-600/20 border-green-500 text-green-300 font-semibold'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            In a Group
                          </button>
                          <button
                            type="button"
                            onClick={() => setSplitType('friends')}
                            className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all border ${
                              splitType === 'friends'
                                ? 'bg-green-600/20 border-green-500 text-green-300 font-semibold'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                            }`}
                          >
                            <User className="w-4 h-4" />
                            With Friend(s)
                          </button>
                        </div>
                      </div>

                      {/* Group Selection Mode */}
                      {splitType === 'group' && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <Label className="text-xs text-gray-400 font-medium">Select Splitwise Group</Label>
                              {groupsStatus === 'loading' && (
                                <span className="text-[11px] text-gray-400 flex items-center">
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" /> Loading...
                                </span>
                              )}
                            </div>
                            <Select
                              value={selectedGroupId}
                              onValueChange={(val) => setSelectedGroupId(val)}
                              disabled={groupsStatus === 'loading' || splitwiseGroups.length === 0}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Choose a group..." />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                {splitwiseGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name} ({group.members?.length || 0} members)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {activeGroup && (
                            <div className="rounded-lg bg-gray-900/60 p-2.5 border border-gray-700/60 text-xs">
                              <p className="text-gray-400 mb-1.5 font-medium">
                                Members in <strong className="text-white">{activeGroup.name}</strong> ({activeGroup.members?.length}):
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {activeGroup.members?.map((m) => (
                                  <span key={m.id} className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                                    {m.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Split mode toggle */}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-gray-300">Split equally among all members</span>
                            <Switch
                              checked={splitEqually}
                              onCheckedChange={(c) => setSplitEqually(c)}
                              className="data-[state=checked]:bg-green-600 scale-90"
                            />
                          </div>

                          {!splitEqually && (
                            <div className="pt-2">
                              <Label className="text-xs text-gray-400">Your Share of this bill (₹)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`Default: ₹${calculation.perPerson.toFixed(2)}`}
                                value={customUserShare}
                                onChange={(e) => setCustomUserShare(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white mt-1 h-9 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Friends Selection Mode */}
                      {splitType === 'friends' && (
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <Input
                              placeholder="Search friends..."
                              value={friendSearchQuery}
                              onChange={(e) => setFriendSearchQuery(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white pl-8 h-8 text-xs"
                            />
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-gray-700 bg-gray-900/60 p-2">
                            {friendsStatus === 'loading' ? (
                              <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading friends...
                              </div>
                            ) : filteredFriends.length === 0 ? (
                              <div className="py-3 text-center text-xs text-gray-400">
                                No friends found.
                              </div>
                            ) : (
                              filteredFriends.map((friend) => {
                                const isSelected = selectedFriendIds.includes(friend.id)
                                return (
                                  <div
                                    key={friend.id}
                                    onClick={() => toggleFriendSelection(friend.id)}
                                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                                      isSelected
                                        ? 'bg-green-950/60 border border-green-500/50 text-white'
                                        : 'hover:bg-gray-800 text-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center font-bold text-[10px] text-gray-300">
                                        {friend.name.charAt(0)}
                                      </div>
                                      <span className="font-medium">{friend.name}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                      isSelected ? 'bg-green-600 border-green-500 text-white' : 'border-gray-600'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3" />}
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>

                          {selectedFriendIds.length > 0 && (
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-gray-300">
                                Split equally with {selectedFriendIds.length} friend{selectedFriendIds.length > 1 ? 's' : ''} + You
                              </span>
                              <Switch
                                checked={splitEqually}
                                onCheckedChange={(c) => setSplitEqually(c)}
                                className="data-[state=checked]:bg-green-600 scale-90"
                              />
                            </div>
                          )}

                          {!splitEqually && selectedFriendIds.length > 0 && (
                            <div className="pt-2">
                              <Label className="text-xs text-gray-400">Your Share of this bill (₹)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`Default: ₹${calculation.perPerson.toFixed(2)}`}
                                value={customUserShare}
                                onChange={(e) => setCustomUserShare(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white mt-1 h-9 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live True Finance / Phantom Expense Preview */}
                      {parseFloat(formData.amount) > 0 && (
                        (splitType === 'group' && selectedGroupId) || 
                        (splitType === 'friends' && selectedFriendIds.length > 0)
                      ) && (
                        <div className="rounded-lg border border-blue-500/30 bg-blue-950/40 p-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-300 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              True Finance Impact
                            </span>
                            <Badge className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px]">
                              Reconciled
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div className="bg-gray-800/90 p-2.5 rounded-md border border-gray-700">
                              <div className="text-gray-400 text-[11px]">Your Share (Budget)</div>
                              <div className="text-base font-bold text-white mt-0.5">
                                ₹{calculation.userShare.toFixed(2)}
                              </div>
                            </div>
                            <div className="bg-gray-800/90 p-2.5 rounded-md border border-gray-700">
                              <div className="text-green-400 text-[11px]">Friend IOU (Asset)</div>
                              <div className="text-base font-bold text-green-400 mt-0.5">
                                +₹{calculation.iouAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Only <strong className="text-white">₹{calculation.userShare.toFixed(2)}</strong> hits your expense budget. <strong className="text-green-400">+₹{calculation.iouAmount.toFixed(2)}</strong> is tracked as an IOU receivable until your friends repay you!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Edit Mode: Display Splitwise link status if already linked
            expenseToEdit.isSplitwiseLinked && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-950/30 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-blue-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    Linked with Splitwise
                  </span>
                  <Badge className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px]">
                    ID: {expenseToEdit.splitwiseExpenseId}
                  </Badge>
                </div>
                <div className="text-gray-400 flex justify-between pt-1">
                  <span>Your Budget Share: <strong className="text-white">₹{expenseToEdit.userShare ?? expenseToEdit.amount}</strong></span>
                  <span>Friend IOU: <strong className="text-green-400">+₹{expenseToEdit.iouAmount ?? 0}</strong></span>
                </div>
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {expenseToEdit && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="flex-1"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="flex-1 border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting}
              className={`flex-1 ${
                isSplitwiseEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {expenseToEdit 
                ? 'Update' 
                : isSplitwiseEnabled 
                  ? 'Add & Split' 
                  : 'Create Expense'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
