"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddVacancyForm() {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [link, setLink] = useState("");
  const [source, setSource] = useState<string>("");
  const [salaryRange, setSalaryRange] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("vacancies").insert({
        user_id: user.id,
        company_name: companyName,
        role_title: roleTitle,
        link,
        source: source === "" ? null : source, // Allow null for optional enum
        salary_range: salaryRange === "" ? null : salaryRange,
        location: location === "" ? null : location,
        notes: notes === "" ? null : notes,
      });

      if (error) throw error;

      router.push("/dashboard"); // Redirect to dashboard after successful addition
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Vacancy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Google"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="roleTitle">Role Title</Label>
            <Input
              id="roleTitle"
              type="text"
              placeholder="Software Engineer"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/job/123"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="hh">HeadHunter</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
            <Input
              id="salaryRange"
              type="text"
              placeholder="$100k - $150k"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              placeholder="Remote, London, New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific details about this vacancy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding vacancy..." : "Add Vacancy"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

