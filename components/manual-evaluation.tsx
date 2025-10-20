"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { MetricEvaluationCard } from "./metric-evaluation-card"
import { SCORING_CRITERIA } from "@/lib/constants"

interface ManualEvaluationProps {
  evaluation: any;
  onSave: () => Promise<void>;
  onScoreChange: (metric: string, score: number) => void;
  onCommentChange: (metric: string, comment: string) => void;
  canEvaluate: boolean;
}

export function ManualEvaluation({
  evaluation,
  onSave,
  onScoreChange,
  onCommentChange,
  canEvaluate
}: ManualEvaluationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manual Evaluation</CardTitle>
            <CardDescription>
              Manual evaluation scores and comments
            </CardDescription>
          </div>
          {canEvaluate && (
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Evaluation'
              ) : (
                'Edit Evaluation'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(SCORING_CRITERIA).map(([metric, { weight }]) => (
              <MetricEvaluationCard
                key={metric}
                title={metric.charAt(0).toUpperCase() + metric.slice(1).replace(/([A-Z])/g, ' $1')}
                maxPoints={weight}
                currentScore={evaluation.metrics[metric].score}
                comment={evaluation.metrics[metric].comment}
                onScoreChange={(score) => onScoreChange(metric, score)}
                onCommentChange={(comment) => onCommentChange(metric, comment)}
                isEditing={isEditing}
              />
            ))}
          </div>
          <div className="space-y-4">
            <Label>Overall Comment</Label>
            <Textarea
              placeholder="Add your overall evaluation comment..."
              value={evaluation.overallComment}
              onChange={(e) => onCommentChange('overall', e.target.value)}
              disabled={!isEditing}
              className="h-32"
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Total Score</p>
              <p className="text-2xl font-bold">
                {Object.values(evaluation.metrics).reduce((total: number, metric: any) => total + metric.score, 0)}/100
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {format(new Date(evaluation.evaluatedAt), 'PPP')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 