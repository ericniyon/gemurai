"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Pill, 
  Package, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit,
  Download,
  RefreshCw,
  FileText,
  Clock,
  TrendingUp,
  Shield,
  Heart,
  Stethoscope,
  ClipboardList,
  Zap,
  Star,
  ArrowRight,
  Filter,
  MoreHorizontal
} from "lucide-react";

interface MedicineRecord {
  id: string;
  animalName: string;
  animalId: string;
  medicineName: string;
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedDate: string;
  dispensedDate?: string;
  status: 'PENDING' | 'DISPENSED' | 'EXPIRED';
  doctorName: string;
  pharmacistName?: string;
  notes?: string;
}

export default function MedicineRecordDashboard() {
  const [records, setRecords] = useState<MedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [dispensingRecords, setDispensingRecords] = useState<any[]>([]);
  const [dispensingRecordId, setDispensingRecordId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pharmacy inventory (medicines)
      const medicinesResponse = await fetch('/api/v1/pharmacy/inventory');
      const medicinesData = await medicinesResponse.json();
      if (medicinesData.success) {
        setMedicines(medicinesData.data);
      }

      // Load prescriptions
      const prescriptionsResponse = await fetch('/api/v1/pharmacy/prescriptions');
      const prescriptionsData = await prescriptionsResponse.json();
      if (prescriptionsData.success) {
        // Convert prescriptions to medicine records format
        const convertedRecords: MedicineRecord[] = prescriptionsData.data.map((prescription: any) => ({
          id: prescription.id,
          animalName: `Animal ${prescription.patientId}`,
          animalId: prescription.patientId,
          medicineName: prescription.items?.[0]?.product?.name || "Unknown Medicine",
          medicineId: prescription.items?.[0]?.productId || "",
          quantity: prescription.items?.[0]?.quantity || 0,
          dosage: prescription.items?.[0]?.dosage || "As directed",
          frequency: prescription.items?.[0]?.frequency || "As needed",
          duration: prescription.items?.[0]?.duration || "7 days",
          prescribedDate: prescription.prescriptionDate,
          dispensedDate: prescription.dispensedAt,
          status: prescription.status === "DISPENSED" ? "DISPENSED" : 
                  prescription.status === "PENDING" ? "PENDING" : "EXPIRED",
          doctorName: `Dr. ${prescription.doctorId}`,
          pharmacistName: prescription.dispensedBy ? `Dr. ${prescription.dispensedBy}` : undefined,
          notes: prescription.notes
        }));
        setRecords(convertedRecords);
      }

      // Load dispensing records
      const dispensingResponse = await fetch('/api/v1/medicine-record/dispensing');
      const dispensingData = await dispensingResponse.json();
      if (dispensingData.success) {
        setDispensingRecords(dispensingData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to sample data if API fails
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleRecords: MedicineRecord[] = [
      {
        id: "1",
        animalName: "Cow #001",
        animalId: "COW-001",
        medicineName: "Penicillin G 300mg/ml",
        medicineId: "MED-001",
        quantity: 10,
        dosage: "300mg/ml",
        frequency: "Once daily",
        duration: "5 days",
        prescribedDate: "2024-01-15",
        dispensedDate: "2024-01-15",
        status: "DISPENSED",
        doctorName: "Dr. Marie Claire (Vet)",
        pharmacistName: "Vet Tech Jean",
        notes: "Administer intramuscularly"
      },
      {
        id: "2",
        animalName: "Chicken Flock #002",
        animalId: "CHICKEN-002",
        medicineName: "Oxytetracycline 200mg/ml",
        medicineId: "MED-002",
        quantity: 5,
        dosage: "200mg/ml",
        frequency: "Once daily",
        duration: "3 days",
        prescribedDate: "2024-01-16",
        status: "PENDING",
        doctorName: "Dr. Paul Nkurunziza (Vet)",
        notes: "Mix with drinking water"
      },
      {
        id: "3",
        animalName: "Sheep #003",
        animalId: "SHEEP-003",
        medicineName: "Ivermectin 1% Injectable",
        medicineId: "MED-003",
        quantity: 2,
        dosage: "1% solution",
        frequency: "Single dose",
        duration: "1 day",
        prescribedDate: "2024-01-14",
        dispensedDate: "2024-01-14",
        status: "DISPENSED",
        doctorName: "Dr. Grace Mukamana (Vet)",
        pharmacistName: "Vet Tech Jean",
        notes: "Subcutaneous injection"
      },
      {
        id: "4",
        animalName: "Goat #004",
        animalId: "GOAT-004",
        medicineName: "Dewormer Albendazole",
        medicineId: "MED-007",
        quantity: 1,
        dosage: "10ml",
        frequency: "Single dose",
        duration: "1 day",
        prescribedDate: "2024-01-17",
        status: "PENDING",
        doctorName: "Dr. Marie Claire (Vet)",
        notes: "Oral administration"
      },
      {
        id: "5",
        animalName: "Pig #005",
        animalId: "PIG-005",
        medicineName: "Iron Dextran Injection",
        medicineId: "MED-009",
        quantity: 5,
        dosage: "2ml",
        frequency: "Single dose",
        duration: "1 day",
        prescribedDate: "2024-01-16",
        dispensedDate: "2024-01-16",
        status: "DISPENSED",
        doctorName: "Dr. Emmanuel Nkurunziza (Vet)",
        pharmacistName: "Vet Tech Paul",
        notes: "Iron supplement injection"
      }
    ];

    setRecords(sampleRecords);
  };

  const handleDispense = async (recordId: string) => {
    try {
      setDispensingRecordId(recordId);
      const response = await fetch(`/api/v1/pharmacy/prescriptions/${recordId}/dispense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dispensedBy: 'current-user-id', // This should come from auth context
          notes: 'Dispensed via dashboard'
        })
      });

      if (response.ok) {
        // Reload data to reflect changes
        await loadData();
      } else {
        console.error('Failed to dispense prescription');
      }
    } catch (error) {
      console.error('Error dispensing prescription:', error);
    } finally {
      setDispensingRecordId(null);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  // Calculate statistics
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'PENDING').length,
    dispensed: records.filter(r => r.status === 'DISPENSED').length,
    expired: records.filter(r => r.status === 'EXPIRED').length,
    totalMedicines: medicines.length,
    lowStockMedicines: medicines.filter(m => m.quantity < 10).length
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || record.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                 <div>
                   <h1 className="text-4xl font-bold tracking-tight">Veterinary Medicine System</h1>
                   <p className="text-blue-100 text-lg">
                     Animal health and veterinary medicine management
                   </p>
                 </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Zap className="h-3 w-3 mr-1" />
                    System Active
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Heart className="h-3 w-3 mr-1" />
                    Animal-Focused
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
               <Button
                 onClick={handleRefresh}
                 variant="secondary"
                 size="lg"
                 className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                 disabled={loading}
               >
                 <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                 {loading ? 'Refreshing...' : 'Refresh Data'}
               </Button>
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Record
                </Button>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
        </div>

        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Animal Treatments</CardTitle>
              <div className="rounded-full bg-blue-500 p-2 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
              <p className="text-xs text-blue-600 font-medium">
                Veterinary prescriptions
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600">+15% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
              <div className="rounded-full bg-orange-500 p-2 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">{stats.pending}</div>
              <p className="text-xs text-orange-600 font-medium">
                Awaiting treatment
              </p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Dispensed</CardTitle>
              <div className="rounded-full bg-green-500 p-2 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{stats.dispensed}</div>
              <p className="text-xs text-green-600 font-medium">
                Successfully treated
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Excellent performance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Expired</CardTitle>
              <div className="rounded-full bg-red-500 p-2 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.expired}</div>
              <p className="text-xs text-red-600 font-medium">
                Expired prescriptions
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600">Needs review</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <Tabs defaultValue="records" className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 h-auto p-1">
              <TabsTrigger 
                value="records" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md py-4 px-6 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Records</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="animals" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md py-4 px-6 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <Users className="h-5 w-5" />
                <span className="font-semibold">Animals</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="medicines" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md py-4 px-6 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <Pill className="h-5 w-5" />
                <span className="font-semibold">Medicines</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="reports" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-md py-4 px-6 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <Activity className="h-5 w-5" />
                <span className="font-semibold">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full bg-blue-500 p-2">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Medicine Records
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Manage animal medicine records and prescriptions with complete tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Enhanced Search and Filter */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search records by animal, medicine, doctor, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 text-base border-0 bg-white shadow-sm focus:shadow-md transition-shadow"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-gray-500" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border-0 rounded-lg bg-white shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="DISPENSED">Dispensed</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>
                    <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      New Record
                    </Button>
                  </div>

                  {/* Enhanced Records List */}
                  <div className="space-y-4">
                    {filteredRecords.map((record, index) => (
                      <Card key={record.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                                    <Users className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-xl text-gray-900">{record.animalName}</div>
                                    <div className="text-sm text-gray-500">Animal ID: {record.animalId}</div>
                                  </div>
                                </div>
                                <Badge 
                                  className={`px-3 py-1 text-sm font-semibold ${
                                    record.status === 'DISPENSED' ? 'bg-green-100 text-green-800 border-green-200' :
                                    record.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                                    'bg-red-100 text-red-800 border-red-200'
                                  }`}
                                >
                                  {record.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-purple-500" />
                                    <span className="font-semibold text-gray-700">Medicine:</span>
                                    <span className="text-gray-600">{record.medicineName} ({record.dosage})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold text-gray-700">Prescription:</span>
                                    <span className="text-gray-600">{record.quantity} units, {record.frequency}, {record.duration}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-green-500" />
                                    <span className="font-semibold text-gray-700">Doctor:</span>
                                    <span className="text-gray-600">{record.doctorName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span className="font-semibold text-gray-700">Prescribed:</span>
                                    <span className="text-gray-600">{new Date(record.prescribedDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {record.dispensedDate && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-800">Dispensed:</span>
                                  <span className="text-green-700">{new Date(record.dispensedDate).toLocaleDateString()} by {record.pharmacistName}</span>
                                </div>
                              )}
                              
                              {record.notes && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-start gap-2">
                                    <ClipboardList className="h-4 w-4 text-blue-600 mt-0.5" />
                                    <div>
                                      <span className="font-semibold text-blue-800">Notes:</span>
                                      <p className="text-blue-700 mt-1">{record.notes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-6">
                              <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
               {record.status === 'PENDING' && (
                 <Button 
                   size="sm" 
                   className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                   onClick={() => handleDispense(record.id)}
                   disabled={dispensingRecordId === record.id}
                 >
                   <Package className={`h-4 w-4 mr-1 ${dispensingRecordId === record.id ? 'animate-spin' : ''}`} />
                   {dispensingRecordId === record.id ? 'Dispensing...' : 'Dispense'}
                 </Button>
               )}
                              <Button size="sm" variant="outline" className="hover:bg-gray-50">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Enhanced Animals Tab */}
          <TabsContent value="animals" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full bg-green-500 p-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Animal Management
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Register new animals, manage medical history, and track prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-6 mb-6 shadow-lg">
                      <Users className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 rounded-full bg-blue-500 p-2">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Animal Management</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Register new animals, manage medical history, track prescriptions, and maintain comprehensive animal records.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Animal
                    </Button>
                    <Button size="lg" variant="outline" className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200">
                      <Eye className="h-5 w-5 mr-2" />
                      View All Animals
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full bg-purple-500 p-2">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  Medicine Inventory
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Track medicine stock, expiry dates, and batch management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <div className="rounded-full bg-gradient-to-r from-purple-500 to-violet-500 p-6 mb-6 shadow-lg">
                      <Pill className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 rounded-full bg-orange-500 p-2">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Medicine Inventory</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Track medicine stock, monitor expiry dates, manage batch information, and ensure proper inventory control.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Medicine
                    </Button>
                    <Button size="lg" variant="outline" className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200">
                      <Package className="h-5 w-5 mr-2" />
                      View Inventory
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="rounded-full bg-orange-500 p-2">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  Reports & Analytics
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Generate comprehensive reports and view system analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="rounded-full bg-blue-500 p-4 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Download className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-blue-800 mb-2">Animal Report</h3>
                        <p className="text-sm text-blue-600 mb-4">Export comprehensive animal data and medical history</p>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="rounded-full bg-green-500 p-4 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Package className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-green-800 mb-2">Dispensing Report</h3>
                        <p className="text-sm text-green-600 mb-4">Detailed medicine usage and dispensing analytics</p>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="rounded-full bg-red-500 p-4 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-red-800 mb-2">Expiry Report</h3>
                        <p className="text-sm text-red-600 mb-4">Monitor expiring medicines and batch alerts</p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}