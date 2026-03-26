import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "@/lib/models";
import connectToDatabase from "@/lib/mongodb";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function StaffApprovalsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== 'staff' || !session.user.isApproved) {
    redirect("/");
  }

  await connectToDatabase();
  const unapprovedUsers = await User.find({ isApproved: false, role: { $exists: true } }).lean();

  async function approveUser(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id && session.user.role === 'staff') {
      await connectToDatabase();
      await User.findByIdAndUpdate(userId, { 
        isApproved: true, 
        approvedBy: session.user.id 
      });
      revalidatePath("/staff/approvals");
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-indigo-950 mb-8 tracking-tight">Pending Account Approvals</h1>
      
      {unapprovedUsers.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="text-4xl mb-4 text-emerald-400">✨</div>
          <p className="text-slate-500 text-lg">All caught up! No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unapprovedUsers.map((user: any) => (
            <div key={user._id.toString()} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {user.image ? (
                   <img src={user.image} alt={user.name} className="w-14 h-14 rounded-full border-2 border-slate-100" />
                  ) : (
                   <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xl">
                     {user.name?.[0]}
                   </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-indigo-950">{user.name}</h3>
                    <p className="text-sm text-slate-500 truncate w-40" title={user.email}>{user.email}</p>
                  </div>
                </div>
                <div className="mb-6 space-y-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <p className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="font-medium text-slate-700">Role:</span> 
                    <span className="capitalize text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full text-xs tracking-wide">{user.role}</span>
                  </p>
                  <p className="flex justify-between pt-1">
                    <span className="font-medium text-slate-700">Guardian Phone:</span> 
                    <span className="text-slate-600 font-medium">{user.parentPhone}</span>
                  </p>
                </div>
              </div>
              <form action={approveUser}>
                <input type="hidden" name="userId" value={user._id.toString()} />
                <Button type="submit" className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-medium py-6 rounded-xl shadow-sm transition-all hover:shadow-md">
                  Approve Account
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
