"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, Crown, Gift, Shield, TrendingUp, Award, Target, Users, Zap } from "lucide-react"
import { recordSaleTranslations } from "@/app/[lang]/translations/record-sale"

export default function RewardsPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const t = recordSaleTranslations[lang]

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/${lang}/dashboard/record-sale`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.rewards.backToRecordSale}
        </Link>
      </div>

      {/* Rewards Program Overview */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.rewards.title}</h1>
        <p className="text-gray-600 mt-2">{t.rewards.subtitle}</p>
      </div>

      {/* Points System */}
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t.rewards.pointsSystem.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Sales Points */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t.rewards.pointsSystem.sales.title}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.sales.regular}</span>
                    <Badge className="bg-yellow-100 text-yellow-700">10 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.sales.highValue}</span>
                    <Badge className="bg-yellow-100 text-yellow-700">25 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.sales.dailyBonus}</span>
                    <Badge className="bg-yellow-100 text-yellow-700">5 {t.pointsSystem.points}</Badge>
                  </li>
                </ul>
              </div>

              {/* Performance Points */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t.rewards.pointsSystem.performance.title}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.performance.perfectWeek}</span>
                    <Badge className="bg-green-100 text-green-700">50 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.performance.monthlyGoal}</span>
                    <Badge className="bg-green-100 text-green-700">100 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.performance.customerRating}</span>
                    <Badge className="bg-green-100 text-green-700">20 {t.pointsSystem.points}</Badge>
                  </li>
                </ul>
              </div>

              {/* Bonus Points */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t.rewards.pointsSystem.bonus.title}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.bonus.newCustomer}</span>
                    <Badge className="bg-blue-100 text-blue-700">15 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.bonus.referral}</span>
                    <Badge className="bg-blue-100 text-blue-700">30 {t.pointsSystem.points}</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>{t.rewards.pointsSystem.bonus.training}</span>
                    <Badge className="bg-blue-100 text-blue-700">25 {t.pointsSystem.points}</Badge>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DCC Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-500" />
              {t.dccLevels.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Level A */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{t.dccLevels.levelA.title}</h3>
                    <Badge className="bg-blue-100 text-blue-700">{t.dccLevels.levelA.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{t.dccLevels.levelA.subtitle}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelA.benefits.priority}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelA.benefits.commission}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelA.benefits.recognition}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Level B */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{t.dccLevels.levelB.title}</h3>
                    <Badge className="bg-blue-100 text-blue-700">{t.dccLevels.levelB.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{t.dccLevels.levelB.subtitle}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelB.benefits.allocation}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelB.benefits.leadership}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelB.benefits.training}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Level C */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{t.dccLevels.levelC.title}</h3>
                    <Badge className="bg-blue-100 text-blue-700">{t.dccLevels.levelC.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{t.dccLevels.levelC.subtitle}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelC.benefits.access}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelC.benefits.commission}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>{t.dccLevels.levelC.benefits.training}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 