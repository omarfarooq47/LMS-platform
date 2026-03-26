import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "@/lib/models";
import connectToDatabase from "@/lib/mongodb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/");
  }

  await connectToDatabase();
  const dbUser = await User.findOne({ email: session.user.email });

  if (dbUser?.role && dbUser?.parentPhone) {
    redirect("/");
  }

  async function submitOnboarding(formData: FormData) {
    "use server";
    const role = formData.get("role") as string;
    const parentPhone = formData.get("parentPhone") as string;

    if (!role || !parentPhone) return;

    await connectToDatabase();
    
    // Server action logic
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
        await User.updateOne({ email: session.user.email }, { role, parentPhone });
    }
    
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md shadow-xl border-slate-100">
        <CardHeader className="text-center pb-8 border-b border-slate-50 mb-8 bg-slate-50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold text-indigo-950">Complete Your Profile</CardTitle>
          <CardDescription className="text-slate-500">
            Welcome to OakTree! Please provide a few more details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitOnboarding} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="role" className="text-slate-700 font-semibold">I am a...</Label>
              <select 
                id="role" 
                name="role" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>Select your role</option>
                <option value="student">Student</option>
                <option value="staff">Staff/Teacher</option>
              </select>
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="parentPhone" className="text-slate-700 font-semibold">Parent/Guardian Phone Number</Label>
              <Input 
                id="parentPhone" 
                name="parentPhone" 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                required 
              />
              <p className="text-xs text-slate-400 mt-1">Required for emergency contact and progress reports.</p>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl shadow-md transition-all">
              Save & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
