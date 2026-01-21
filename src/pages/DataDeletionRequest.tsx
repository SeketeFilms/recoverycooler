import { useState } from "react";
import { ArrowLeft, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const DataDeletionRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !confirmDelete) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and confirm the deletion request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission - in production, this would send to your backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Request Submitted",
      description: "Your data deletion request has been received.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Request Submitted</h2>
              <p className="text-muted-foreground mb-6">
                Your data deletion request has been received. We will process your request within 30 days as required by GDPR. You will receive a confirmation email at <strong>{email}</strong> once your data has been deleted.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Reference ID: DEL-{Date.now().toString(36).toUpperCase()}
              </p>
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-8 h-8 text-destructive" />
          <h1 className="text-2xl font-bold">Data Deletion Request</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Rights Under GDPR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Under the General Data Protection Regulation (GDPR) and Google Play Store requirements, you have the right to request the deletion of your personal data. This is also known as the "right to be forgotten."
            </p>
            <p>
              When you submit a deletion request, we will permanently remove all data associated with your account within 30 days.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Data That Will Be Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Account information (name, email, profile picture)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Recovery progress and streak data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Journal entries and personal notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Spending logs and financial tracking data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Community posts and comments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Chat conversations with AI assistant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>Accountability partner connections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>All other personal data stored in our systems</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Submit Deletion Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address Associated with Your Account
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="confirm"
                  checked={confirmDelete}
                  onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
                />
                <label htmlFor="confirm" className="text-sm text-muted-foreground leading-relaxed">
                  I understand that this action is irreversible. All my data will be permanently deleted and cannot be recovered. I will lose access to my account and all recovery progress.
                </label>
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={isSubmitting || !email || !confirmDelete}
              >
                {isSubmitting ? "Submitting..." : "Submit Deletion Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alternative Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Before requesting complete data deletion, consider these alternatives:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Export Your Data:</strong> Download a copy of your data before deletion from the app settings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Delete Specific Data:</strong> Remove individual journal entries or posts within the app.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Contact Support:</strong> Reach out to us if you have specific concerns about your data.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            For questions about data deletion, contact us at:{" "}
            <a href="mailto:info@semogrouptech.com" className="text-primary hover:underline">
              info@semogrouptech.com
            </a>
          </p>
          <p className="mt-2">
            Recovery Cooler by Semo Group Tech
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionRequest;
