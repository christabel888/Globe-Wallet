"use client"

import { useState, useMemo } from "react"
import { Send, CheckCircle2, AlertCircle, Loader2, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet, usePricing } from "@/hooks/useFinanceServices"
import { useBalances } from "@/hooks/useBalances"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SendForm() {
  const { sendPayment, validateAddress, isProcessing } = useWallet()
  const { formatAsset } = usePricing()
  const { assets } = useBalances()

  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("XLM")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const currentAssetBalance = useMemo(() => {
    return assets.find(a => a.code === selectedAsset)?.balance || 0
  }, [assets, selectedAsset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateAddress(address)) {
      setError("Invalid Stellar address")
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (numAmount > currentAssetBalance) {
      setError(`Insufficient ${selectedAsset} balance`)
      return
    }

    try {
      const result = await sendPayment(address, numAmount, selectedAsset as any, memo)
      if (result.status === "completed") {
        setSuccess(`Successfully sent ${formatAsset(numAmount, selectedAsset as any)} to ${address.slice(0, 8)}...`)
        setAddress("")
        setAmount("")
        setMemo("")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send payment")
    }
  }

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Send Assets
        </CardTitle>
        <CardDescription>Transfer Lumens or tokens securely to any Stellar address.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Recipient Address</label>
            <Input
              id="address"
              placeholder="e.g. GDXSPAY..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">Amount</label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset</label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.code} value={asset.code}>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-primary" />
                        {asset.code}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-muted-foreground italic">
              Balance: {formatAsset(currentAssetBalance, selectedAsset as any)}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="memo" className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Memo <span className="text-[10px] uppercase font-bold opacity-50 px-1.5 py-0.5 bg-muted rounded">Optional</span>
            </label>
            <Input
              id="memo"
              placeholder="Transaction note"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-background/50 h-8 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              {success}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full group relative overflow-hidden"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            )}
            {isProcessing ? "Processing..." : "Confirm Send"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
