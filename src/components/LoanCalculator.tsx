import { motion } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Calendar, ChevronDown, ChevronUp, Info, Mail, Send, User, FileText, Files, TrendingUp, TrendingDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const LoanCalculator = () => {
  const [amount, setAmount] = useState(2000);
  const [period, setPeriod] = useState(5);
  const [interestRate, setInterestRate] = useState(4.95);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [isLoanSummaryOpen, setIsLoanSummaryOpen] = useState(false);
  const [repaymentFrequency, setRepaymentFrequency] = useState("monthly");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [comparisonTerm, setComparisonTerm] = useState<number | null>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const calculateMonthlyPayment = (loanAmount = amount, loanPeriod = period, rate = interestRate, frequency = repaymentFrequency) => {
    const paymentsPerYear = frequency === "monthly" ? 12 : 26;
    const periodicRate = rate / 100 / paymentsPerYear;
    const numberOfPayments = loanPeriod * paymentsPerYear;
    
    const periodicPayment =
      (loanAmount * periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) /
      (Math.pow(1 + periodicRate, numberOfPayments) - 1);
    
    return periodicPayment;
  };

  const calculateTotalInterest = (loanAmount = amount, loanPeriod = period, rate = interestRate, frequency = repaymentFrequency) => {
    const paymentsPerYear = frequency === "monthly" ? 12 : 26;
    const totalPayments = loanPeriod * paymentsPerYear;
    const payment = calculateMonthlyPayment(loanAmount, loanPeriod, rate, frequency);
    const totalRepaid = payment * totalPayments;
    return totalRepaid - loanAmount;
  };

  const periodicPayment = calculateMonthlyPayment();
  const totalRepayment = periodicPayment * (repaymentFrequency === "monthly" ? period * 12 : period * 26);
  const totalInterest = calculateTotalInterest();

  const comparisonPayment = comparisonTerm ? calculateMonthlyPayment(amount, comparisonTerm) : null;
  const comparisonTotalRepayment = comparisonTerm ? 
    comparisonPayment! * (repaymentFrequency === "monthly" ? comparisonTerm * 12 : comparisonTerm * 26) : 
    null;
  const comparisonSavings = comparisonTerm && comparisonTerm < period ? 
    totalRepayment - comparisonTotalRepayment! : 
    null;

  const generateSmartSuggestion = () => {
    if (period > 3) {
      const shorterPeriod = period - 1;
      const shorterPayment = calculateMonthlyPayment(amount, shorterPeriod);
      const shorterTotalRepayment = shorterPayment * (repaymentFrequency === "monthly" ? shorterPeriod * 12 : shorterPeriod * 26);
      const savings = totalRepayment - shorterTotalRepayment;

      return {
        text: `Save £${savings.toFixed(0)} by choosing a ${shorterPeriod}-year term`,
        savings,
        period: shorterPeriod,
      };
    }
    return null;
  };

  const smartSuggestion = generateSmartSuggestion();

  const handleFormSubmit = () => {
    console.log("Form submitted with:", {
      amount,
      period,
      interestRate,
      paymentMethod,
      repaymentFrequency,
      fullName,
      email,
    });

    toast({
      title: "Application Submitted",
      description: "We'll be in touch soon!",
    });

    setFormSubmitted(true);
  };

  const generateMonthlyBreakdown = () => {
    const breakdown = [];
    let remainingBalance = amount;
    const paymentsPerYear = repaymentFrequency === "monthly" ? 12 : 26;
    const totalPayments = period * paymentsPerYear;
    
    for (let i = 1; i <= Math.min(totalPayments, 12); i++) {
      const interestForPeriod = remainingBalance * (interestRate / 100 / paymentsPerYear);
      const principal = periodicPayment - interestForPeriod;
      
      remainingBalance -= principal;
      
      breakdown.push({
        payment: i,
        total: periodicPayment,
        principal,
        interest: interestForPeriod,
        balance: remainingBalance,
      });
    }
    
    return breakdown;
  };

  const monthlyBreakdown = generateMonthlyBreakdown();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Borrow Amount
            </label>
            <Slider
              value={[amount]}
              onValueChange={(value) => setAmount(value[0])}
              max={20000}
              min={1000}
              step={100}
              className="w-full"
            />
            <motion.div
              key={amount}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold dark:text-white"
            >
              £{amount.toLocaleString()}
            </motion.div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>£1,000</span>
              <span>£20,000</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Payment Period
            </label>
            <Slider
              value={[period]}
              onValueChange={(value) => setPeriod(value[0])}
              max={15}
              min={1}
              step={1}
              className="w-full"
            />
            <motion.div
              key={period}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold dark:text-white"
            >
              {period} {period === 1 ? "Year" : "Years"}
            </motion.div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>1 Year</span>
              <span>15 Years</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">APR %</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16} className="text-gray-500 dark:text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Annual Percentage Rate (APR) represents the yearly cost of your loan, including interest and fees.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">01/01/2025</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SlidersHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <Slider
                value={[interestRate]}
                onValueChange={(value) => setInterestRate(parseFloat(value[0].toFixed(2)))}
                max={20}
                min={0.5}
                step={0.05}
                className="w-full"
              />
            </div>
            <motion.div
              key={interestRate}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold dark:text-white"
            >
              {interestRate}%
            </motion.div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>0.5%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Repayment Frequency
            </label>
            <RadioGroup
              value={repaymentFrequency}
              onValueChange={setRepaymentFrequency}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="dark:text-gray-200">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biweekly" id="biweekly" />
                <Label htmlFor="biweekly" className="dark:text-gray-200">Bi-Weekly</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Payment Method
            </label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="dark:text-gray-200">Deposit Bank Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="dark:text-gray-200">Cash</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold dark:text-white">
              {repaymentFrequency === "monthly" ? "Monthly" : "Bi-Weekly"} Payment
            </h2>
            <motion.div
              key={`${periodicPayment}-${repaymentFrequency}`}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-bold text-[#4AE3B5]"
            >
              £{periodicPayment.toFixed(2)}
            </motion.div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fees Included</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">BORROWING</p>
              <p className="text-2xl font-bold dark:text-white">£{amount.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">TO REPAY</p>
              <p className="text-2xl font-bold dark:text-white">
                £{totalRepayment.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {smartSuggestion && (
            <Card className="border-2 border-[#4AE3B5] bg-green-50 dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-[#4AE3B5]" />
                  <p className="text-sm font-medium">{smartSuggestion.text}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setComparisonTerm(smartSuggestion.period)}
                  >
                    Compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonTerm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparison: {period} vs {comparisonTerm} Years</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Term ({period} years)</p>
                    <p className="font-bold">£{periodicPayment.toFixed(2)} / {repaymentFrequency === "monthly" ? "month" : "2 weeks"}</p>
                    <p className="font-bold">£{totalRepayment.toFixed(0)} total</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Alternative ({comparisonTerm} years)</p>
                    <p className="font-bold">£{comparisonPayment?.toFixed(2)} / {repaymentFrequency === "monthly" ? "month" : "2 weeks"}</p>
                    <p className="font-bold">£{comparisonTotalRepayment?.toFixed(0)} total</p>
                  </div>
                </div>
                {comparisonSavings && comparisonSavings > 0 && (
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-[#4AE3B5]" />
                    <span className="text-sm font-medium">Potential savings: £{comparisonSavings.toFixed(0)}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setComparisonTerm(null)}
                  className="w-full"
                >
                  Close Comparison
                </Button>
              </CardContent>
            </Card>
          )}

          <Collapsible 
            open={isLoanSummaryOpen} 
            onOpenChange={setIsLoanSummaryOpen} 
            className="border rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Loan Summary</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isLoanSummaryOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">PRINCIPAL</p>
                  <p className="text-xl font-bold dark:text-white">£{amount.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">TOTAL INTEREST</p>
                  <p className="text-xl font-bold dark:text-white">
                    £{totalInterest.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="py-2 px-3 text-left">Payment</th>
                      <th className="py-2 px-3 text-left">Total</th>
                      <th className="py-2 px-3 text-left">Principal</th>
                      <th className="py-2 px-3 text-left">Interest</th>
                      <th className="py-2 px-3 text-left">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((row) => (
                      <tr key={row.payment} className="border-t">
                        <td className="py-2 px-3">{repaymentFrequency === "monthly" ? `Month ${row.payment}` : `Week ${row.payment * 2}`}</td>
                        <td className="py-2 px-3">£{row.total.toFixed(2)}</td>
                        <td className="py-2 px-3">£{row.principal.toFixed(2)}</td>
                        <td className="py-2 px-3">£{row.interest.toFixed(2)}</td>
                        <td className="py-2 px-3">£{row.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Files className="h-4 w-4" />
                  <span>CSV</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Print</span>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {formSubmitted ? (
            <Card className="border-green-500">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center">Application Submitted!</h3>
                <p className="text-center text-gray-600">
                  Thank you for your application. We'll review your details and get back to you shortly.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setFormSubmitted(false)}
                >
                  Submit Another Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text"
                    placeholder="Full Name"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="email"
                    placeholder="Email Address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full text-lg py-6 hover:scale-105 transition-transform flex items-center justify-center space-x-2" 
                size="lg"
                onClick={handleFormSubmit}
              >
                <Send className="h-5 w-5" />
                <span>SEND FORM</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
