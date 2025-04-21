"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { RewardCard } from "@/lib/types"

interface DailyCardsProgressProps {
  rewardCards: RewardCard[]
}

export default function DailyCardsProgress({ rewardCards }: DailyCardsProgressProps) {
  // Daily limits
  const BASIC_CARDS_LIMIT = 4 // 1 and 2 point cards combined
  const GOLD_CARDS_LIMIT = 2 // Arany kártya (3 points)

  const [todayBasicCards, setTodayBasicCards] = useState(0)
  const [todayGoldCards, setTodayGoldCards] = useState(0)

  useEffect(() => {
    // Get today's start timestamp (midnight)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Filter cards issued today
    const cardsIssuedToday = rewardCards.filter((card) => card.issuedAt >= todayTimestamp && !card.isRedeemed)

    // Count basic and gold cards
    const basicCards = cardsIssuedToday.filter((card) => card.cardType === "basic" || card.cardType === "gold").length

    const goldCards = cardsIssuedToday.filter((card) => card.cardType === "platinum").length

    setTodayBasicCards(basicCards)
    setTodayGoldCards(goldCards)
  }, [rewardCards])

  // Calculate remaining cards
  const remainingBasicCards = BASIC_CARDS_LIMIT - todayBasicCards
  const remainingGoldCards = GOLD_CARDS_LIMIT - todayGoldCards

  // Calculate progress percentages
  const basicCardsPercentage = (todayBasicCards / BASIC_CARDS_LIMIT) * 100
  const goldCardsPercentage = (todayGoldCards / GOLD_CARDS_LIMIT) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mai kártyák</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Naponta maximum 4 alap kártya (1 és 2 pontos) és 2 Arany kártya adható ki.</p>
              <p>A vonal a délelőtti és délutáni műszakot választja el.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">1 és 2 pontos kártyák</span>
              <span className="text-sm font-medium">
                {todayBasicCards}/{BASIC_CARDS_LIMIT}
              </span>
            </div>
            <div className="relative">
              <Progress value={basicCardsPercentage} className="h-3" />
              {/* Divider for morning/afternoon shifts */}
              <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-black z-10"></div>
            </div>
            <div className="text-xs text-right mt-1 text-muted-foreground">
              Még kiadható: {remainingBasicCards > 0 ? remainingBasicCards : 0}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Arany kártyák</span>
              <span className="text-sm font-medium">
                {todayGoldCards}/{GOLD_CARDS_LIMIT}
              </span>
            </div>
            <div className="relative">
              <Progress value={goldCardsPercentage} className="h-3" />
              {/* Divider for morning/afternoon shifts */}
              <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-black z-10"></div>
            </div>
            <div className="text-xs text-right mt-1 text-muted-foreground">
              Még kiadható: {remainingGoldCards > 0 ? remainingGoldCards : 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
