"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { ReferralModal } from "./referral-modal"

interface ReferralButtonProps {
  userId: string
}

export function ReferralButton({ userId }: ReferralButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
        <Users className="w-4 h-4 mr-2" />
        Invite
      </Button>

      <ReferralModal isOpen={showModal} onClose={() => setShowModal(false)} userId={userId} />
    </>
  )
}
