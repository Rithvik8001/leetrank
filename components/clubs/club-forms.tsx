"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  submitClubApplication,
  applyToClub,
  createClubAnnouncement,
  decideClubMember,
  changeClubMemberRole,
  removeClubMember,
  transferClubOwnership,
  archiveClubAnnouncement,
} from "@/app/clubs/actions";
import {
  reviewClubApplication,
  setClubSuspension,
} from "@/app/admin/clubs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function useResult() {
  const [pending, start] = useTransition();
  const run = (
    work: () => Promise<{ ok: boolean; error?: string }>,
    success: string,
  ) =>
    start(async () => {
      const result = await work();
      if (result.ok) toast.success(success);
      else toast.error(result.error);
    });
  return { pending, run };
}
export function ClubApplicationForm({ groupId }: { groupId: string }) {
  const { pending, run } = useResult();
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <Button onClick={() => setOpen(true)}>Apply for Official Club</Button>
    );
  return (
    <form
      className="grid gap-4 border-t border-border pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () => submitClubApplication(groupId, Object.fromEntries(f) as never),
          "Application submitted.",
        );
      }}
    >
      <h2 className="font-heading text-xl font-extrabold">
        Official club application
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["proposedName", "Public club name"],
          ["requestedSlug", "Club URL slug"],
          ["officialWebsiteUrl", "Official website"],
          ["facultyAdvisorName", "Faculty advisor"],
          ["facultyAdvisorEmail", "Advisor email"],
          ["contactEmail", "Public contact email"],
          ["githubUrl", "GitHub URL (optional)"],
          ["discordUrl", "Discord URL (optional)"],
        ].map(([name, label]) => (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
                required={name !== "githubUrl" && name !== "discordUrl"}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          minLength={30}
          maxLength={600}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="evidenceNote">Recognition evidence</Label>
        <Textarea
          id="evidenceNote"
          name="evidenceNote"
          minLength={50}
          maxLength={1000}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          {pending ? "Submitting..." : "Submit application"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ClubJoinForm({
  groupId,
  pendingApplication,
}: {
  groupId: string;
  pendingApplication: boolean;
}) {
  const { pending, run } = useResult();
  const [message, setMessage] = useState("");
  if (pendingApplication)
    return (
      <p className="font-mono text-xs text-muted-foreground">
        Membership application pending
      </p>
    );
  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => applyToClub(groupId, message), "Application submitted.");
      }}
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        placeholder="Tell the officers why you would like to join (optional)"
      />
      <Button disabled={pending} type="submit">
        Apply to join
      </Button>
    </form>
  );
}

export function AnnouncementForm({ groupId }: { groupId: string }) {
  const { pending, run } = useResult();
  return (
    <form
      className="grid gap-3 border border-border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            createClubAnnouncement(groupId, {
              title: String(f.get("title")),
              body: String(f.get("body")),
              visibility: String(f.get("visibility")) as "PUBLIC" | "MEMBERS",
            }),
          "Announcement published.",
        );
        e.currentTarget.reset();
      }}
    >
      <Input
        name="title"
        placeholder="Announcement title"
        maxLength={100}
        required
      />
      <Textarea
        name="body"
        placeholder="Update your club members"
        maxLength={2000}
        required
      />
      <select
        name="visibility"
        className="h-9 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="MEMBERS">Members only</option>
        <option value="PUBLIC">Public</option>
      </select>
      <Button disabled={pending} type="submit">
        Publish
      </Button>
    </form>
  );
}

export function AnnouncementArchiveButton({
  groupId,
  id,
}: {
  groupId: string;
  id: string;
}) {
  const { pending, run } = useResult();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        run(
          () => archiveClubAnnouncement(groupId, id),
          "Announcement archived.",
        )
      }
    >
      Archive
    </Button>
  );
}
export function MembershipDecisionButtons({
  groupId,
  applicationId,
}: {
  groupId: string;
  applicationId: string;
}) {
  const { pending, run } = useResult();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          run(
            () => decideClubMember(groupId, applicationId, "APPROVED"),
            "Member approved.",
          )
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          run(
            () => decideClubMember(groupId, applicationId, "REJECTED"),
            "Application rejected.",
          )
        }
      >
        Reject
      </Button>
    </div>
  );
}
export function MemberControls({
  groupId,
  userId,
  role,
  canManage,
}: {
  groupId: string;
  userId: string;
  role: string;
  canManage: boolean;
}) {
  const { pending, run } = useResult();
  if (!canManage || role === "OWNER") return null;
  return (
    <div className="flex flex-wrap gap-2">
      <select
        aria-label="Member role"
        disabled={pending}
        value={role}
        onChange={(e) =>
          run(
            () =>
              changeClubMemberRole(
                groupId,
                userId,
                e.target.value as "MEMBER" | "OFFICER" | "ADMIN",
              ),
            "Role updated.",
          )
        }
        className="h-8 rounded-md border border-border bg-background px-2 text-xs"
      >
        <option>MEMBER</option>
        <option>OFFICER</option>
        <option>ADMIN</option>
      </select>
      {role === "ADMIN" ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            run(
              () => transferClubOwnership(groupId, userId),
              "Ownership transferred.",
            )
          }
        >
          Transfer ownership
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const reason = window.prompt("Reason for removal");
          if (reason)
            run(
              () => removeClubMember(groupId, userId, reason),
              "Member removed.",
            );
        }}
      >
        Remove
      </Button>
    </div>
  );
}

export function ClubReviewControls({
  applicationId,
  groupId,
  isApproved,
  isSuspended,
}: {
  applicationId: string;
  groupId: string;
  isApproved: boolean;
  isSuspended: boolean;
}) {
  const { pending, run } = useResult();
  if (isApproved)
    return (
      <Button
        disabled={pending}
        variant="outline"
        onClick={() => {
          const note = isSuspended ? "" : window.prompt("Suspension reason");
          if (isSuspended || note)
            run(
              () => setClubSuspension(groupId, !isSuspended, note ?? ""),
              isSuspended ? "Club reactivated." : "Club suspended.",
            );
        }}
      >
        {isSuspended ? "Reactivate" : "Suspend"}
      </Button>
    );
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        disabled={pending}
        onClick={() =>
          run(
            () => reviewClubApplication(applicationId, "APPROVED", ""),
            "Club approved.",
          )
        }
      >
        Approve
      </Button>
      <Button
        disabled={pending}
        variant="outline"
        onClick={() => {
          const n = window.prompt("Requested changes");
          if (n)
            run(
              () =>
                reviewClubApplication(applicationId, "CHANGES_REQUESTED", n),
              "Changes requested.",
            );
        }}
      >
        Request changes
      </Button>
      <Button
        disabled={pending}
        variant="ghost"
        onClick={() => {
          const n = window.prompt("Rejection reason");
          if (n)
            run(
              () => reviewClubApplication(applicationId, "REJECTED", n),
              "Application rejected.",
            );
        }}
      >
        Reject
      </Button>
    </div>
  );
}
