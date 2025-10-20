"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ArrowLeft, Send, CreditCard, Smartphone, Banknote, Info, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function FinanceRequestPage() {
	const router = useRouter()
	const params = useParams()
	const lang = (params?.lang as string) || "en"
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

	const [form, setForm] = useState({
		amount: "",
		method: "mobile_money", // mobile_money | bank_transfer | cash
		accountName: "",
		accountNumber: "",
		phone: "",
		description: "",
		reference: "",
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const validate = () => {
		if (!form.amount || Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
			return "Please enter a valid amount"
		}
		if (form.method === "mobile_money" && !form.phone) {
			return "Please provide a mobile money phone number"
		}
		if (form.method === "bank_transfer" && (!form.accountName || !form.accountNumber)) {
			return "Please provide bank account name and number"
		}
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setResult(null)
		const error = validate()
		if (error) {
			setResult({ success: false, message: error })
			return
		}
		setIsSubmitting(true)
		try {
			// Placeholder: simulate API call
			await new Promise((resolve) => setTimeout(resolve, 900))
			setResult({ success: true, message: "Finance request submitted successfully" })
			setForm({ amount: "", method: "mobile_money", accountName: "", accountNumber: "", phone: "", description: "", reference: "" })
		} catch (err) {
			setResult({ success: false, message: "Failed to submit request" })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => router.back()}
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</Button>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Request Payment</h1>
								<p className="text-gray-600 mt-1">Submit a payout or reimbursement request</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2">
						<Card className="border-gray-200 shadow-sm">
							<CardHeader>
								<CardTitle className="text-xl font-semibold text-gray-900">Request Details</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label htmlFor="amount">Amount</Label>
											<div className="relative mt-2">
												<Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={handleChange} className="pl-10" />
												<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
											</div>
										</div>
										<div>
											<Label htmlFor="method">Payment Method</Label>
											<select id="method" name="method" value={form.method} onChange={handleChange} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
												<option value="mobile_money">Mobile Money</option>
												<option value="bank_transfer">Bank Transfer</option>
												<option value="cash">Cash</option>
											</select>
										</div>
									</div>

									{/* Conditional fields */}
									{form.method === "mobile_money" && (
										<div>
											<Label htmlFor="phone">MOMO Phone Number</Label>
											<Input id="phone" name="phone" placeholder="e.g. +2507XXXXXXXX" value={form.phone} onChange={handleChange} className="mt-2" />
										</div>
									)}

									{form.method === "bank_transfer" && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<Label htmlFor="accountName">Account Name</Label>
												<Input id="accountName" name="accountName" placeholder="Account holder name" value={form.accountName} onChange={handleChange} className="mt-2" />
											</div>
											<div>
												<Label htmlFor="accountNumber">Account Number</Label>
												<Input id="accountNumber" name="accountNumber" placeholder="e.g. 1234 5678 9012" value={form.accountNumber} onChange={handleChange} className="mt-2" />
											</div>
										</div>
									)}

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label htmlFor="reference">Reference (optional)</Label>
											<Input id="reference" name="reference" placeholder="Your reference or memo" value={form.reference} onChange={handleChange} className="mt-2" />
										</div>
										<div>
											<Label htmlFor="description">Description</Label>
											<Textarea id="description" name="description" placeholder="Describe the purpose of this request" value={form.description} onChange={handleChange} className="mt-2" rows={4} />
										</div>
									</div>

									<div className="flex items-center gap-3 pt-2">
										<Button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
											<Send className="w-4 h-4" />
											{isSubmitting ? "Submitting..." : "Submit Request"}
										</Button>
										<Button type="button" variant="outline" onClick={() => router.push(`/${lang}/dashboard/finance`)}>
											Cancel
										</Button>
									</div>

									{result && (
										<div className={`mt-4 p-3 rounded-md border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
											<div className="flex items-center gap-2 text-sm">
												{result.success ? (
													<CheckCircle className="w-4 h-4 text-green-600" />
												) : (
													<XCircle className="w-4 h-4 text-red-600" />
												)}
												<span className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</span>
											</div>
										</div>
									)}
								</form>
							</CardContent>
						</Card>
					</div>

					<div className="md:col-span-1">
						<Card className="border-gray-200 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold text-gray-900">Guidelines</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-gray-600 space-y-3">
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 mt-0.5 text-gray-500" />
									<p>Ensure the amount is accurate and the payment method details are correct.</p>
								</div>
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 mt-0.5 text-gray-500" />
									<p>Mobile money requests require a valid phone number. Bank transfers require account name and number.</p>
								</div>
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 mt-0.5 text-gray-500" />
									<p>Use the description to provide context for faster processing.</p>
								</div>
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 mt-0.5 text-gray-500" />
									<p>After submission, you will receive an email confirmation.</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border-gray-200 shadow-sm mt-6">
							<CardHeader>
								<CardTitle className="text-sm font-semibold text-gray-900">Supported Methods</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-green-600" /><span>Mobile Money (MOMO)</span></div>
								<div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /><span>Bank Transfer</span></div>
								<div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-yellow-700" /><span>Cash (on-site)</span></div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
