import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, CheckCircle, Award, Play, Download } from "lucide-react"

export default function DCCLearning() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Learning</h2>
          <p className="text-muted-foreground">Track your progress and continue your training</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Certificates
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses Completed</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates Earned</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Hours</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses in Progress</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Sales Techniques for DCCs</h3>
                    <p className="text-sm text-muted-foreground">Learn effective sales strategies</p>
                  </div>
                  <Badge variant="outline">6 hours</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">Module 3 of 4</span>
                  <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Digital Health Literacy</h3>
                    <p className="text-sm text-muted-foreground">Understanding digital health tools</p>
                  </div>
                  <Badge variant="outline">8 hours</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">Module 2 of 5</span>
                  <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Entrepreneurship Basics</h3>
                    <p className="text-sm text-muted-foreground">Building your business skills</p>
                  </div>
                  <Badge variant="outline">5 hours</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">Module 1 of 6</span>
                  <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
              <CardDescription>Your learning achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Health Products Basics</h3>
                    <p className="text-sm text-muted-foreground">Completed on May 15, 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    <Badge variant="outline">4 hours</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Certificate earned</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Certificate
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">Malaria Prevention</h3>
                    <p className="text-sm text-muted-foreground">Completed on April 28, 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    <Badge variant="outline">3 hours</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Certificate earned</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>Expand your knowledge and skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">Available courses will be displayed here</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
              <CardDescription>Download and share your achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Certificate management will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
