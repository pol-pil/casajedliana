// resources/js/pages/Accommodations/Index.tsx
import { useMemo, useState } from "react"
import AppLayout from '@/layouts/app-layout'
import type { BreadcrumbItem } from '@/types'
import { Head, usePage, router } from '@inertiajs/react'
import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* UI */
import { Card, CardContent } from "@/components/ui/card"
import { Bed } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarDays } from 'lucide-react'

/* ====================== */
/* Breadcrumbs */
/* ====================== */
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Rooms', href: '/rooms' },
]

/* ====================== */
/* Types */
/* ====================== */

type Status =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Pencil"
  | "Cleaning"
  | "Maintenance"

type Category =
  | "Standard"
  | "Suite"
  | "Quadro"
  | "Family"
  | "Penthouse"
  | "Rest House"

type Item = {
  id: number
  roomNumber: string
  category: Category
  capacity: number
  beds: string
  amenities: string[]
  status: Status
  price?: number
  // optionally may include bookings if controller sent them
  bookings?: any[]
}

/* ====================== */
/* Mock Amenities (client-side only) */
/* ====================== */

const mockAmenities: Record<string, string[]> = {
  Standard: [
    "Air Conditioning",
    "Private Bathroom",
    '32" Smart TV',
    "Wi-Fi",
    "Wardrobe",
    "Work Desk",
  ],
  Suite: [
    "Living Area",
    "Mini Refrigerator",
    '50" Smart TV',
    "Sofa Lounge",
    "Coffee Table",
    "Wi-Fi",
  ],
  Quadro: ["Large Bathroom", "Dining Table", "Smart TV", "Wi-Fi"],
  Family: ["Connecting Rooms", "Entertainment System", "Dining Area", "Wi-Fi"],
  Penthouse: [
    "Private Balcony",
    "Mini Bar",
    "Premium Bathroom",
    "Lounge Area",
    "Wi-Fi",
  ],
  "Rest House": ["Kitchenette", "Outdoor Seating", "Large Dining Area", "Wi-Fi"],
}

/* ====================== */
/* Helpers: status normalization */
/* ====================== */

function mapBookingStatusToRoomStatus(s?: string): Status {
  const st = (s ?? "").toLowerCase()
  if (["checked_in", "occupied", "checkedin"].includes(st)) return "Occupied"
  if (["reserved", "confirmed"].includes(st)) return "Reserved"
  if (["pencil", "tentative"].includes(st)) return "Pencil"
  if (["cleaning", "completed"].includes(st)) return "Cleaning"
  return "Occupied" // fallback when a booking exists and status not matched
}

function normalizeStatusFromDb(s?: string): Status {
  const st = (s ?? "available").toLowerCase()
  if (st === "available") return "Available"
  if (st === "occupied") return "Occupied"
  if (st === "reserved") return "Reserved"
  if (st === "pencil") return "Pencil"
  if (st === "cleaning" || st === "completed") return "Cleaning"
  return "Available"
}

/* ====================== */
/* Status color helper */
/* ====================== */

const statusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-500/20 text-green-400"
    case "Occupied":
      return "bg-red-500/20 text-red-400"
    case "Reserved":
      return "bg-yellow-500/20 text-yellow-400"
    case "Pencil":
      return "bg-orange-500/20 text-orange-400"
    case "Cleaning":
      return "bg-blue-500/20 text-blue-400"
    case "Maintenance":
      return "bg-gray-500/20 text-gray-400"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

/* ====================== */
/* Page component */
/* ====================== */

export default function Index() {
  // read server props (works with raw rooms or transformed rooms)
  const { props } = usePage() as any
  const rawRooms = props.rooms ?? []
  const serverSelectedDate = props.selectedDate ?? new Date().toISOString().slice(0, 10)

  /* ====================== */
  /* Local date picker state (same UI/format as Dashboard) */
  /* ====================== */
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(serverSelectedDate)
  const [tempDate, setTempDate] = useState<Date | null>(new Date(selectedDate))

  /* ====================== */
  /* Normalize server rows to Item[] shape (safe) */
  /* ====================== */
  const normalizedRooms: Item[] = rawRooms.map((r: any) => {

  const id = r.id
  const roomNumber = r.roomNumber ?? r.room_number ?? String(id)
  const category = (r.category ?? r.room_type ?? "Standard") as Category
  const capacity = Number(r.capacity ?? 1)
  const beds = r.beds ?? r.description ?? ""
  const amenities =
    r.amenities && Array.isArray(r.amenities) && r.amenities.length > 0
      ? r.amenities
      : mockAmenities[r.room_type ?? r.category ?? "Standard"] ?? []

  // 🔥 TRUST BACKEND STATUS DIRECTLY
  const status = r.status as Status

  return {
    id,
    roomNumber,
    category,
    capacity,
    beds,
    amenities,
    status,
    price: r.price ?? undefined,
  }
})

  /* ====================== */
  /* Filters/state */
  /* ====================== */
  const [search, setSearch] = useState<string>("")
  const [activeStatus, setActiveStatus] = useState<Status | "All">("All")
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All")

  /* ====================== */
  /* Filter logic (client-side) */
  /* ====================== */
  const filteredRooms = useMemo(() => {
    return normalizedRooms.filter(room => {
      const matchSearch = room.roomNumber.toLowerCase().includes(search.toLowerCase())
      const matchStatus = activeStatus === "All" || room.status === activeStatus
      const matchCategory = activeCategory === "All" || room.category === activeCategory
      return matchSearch && matchStatus && matchCategory
    })
  }, [normalizedRooms, search, activeStatus, activeCategory])

  /* ====================== */
  /* Date apply handler (same as Dashboard) */
  /* ====================== */
  function applyTempDate() {
    if (!tempDate) {
      setIsDateOpen(false)
      return
    }
    const formatted = format(tempDate, "yyyy-MM-dd")
    setSelectedDate(formatted)
    // request server to recompute availability for selected date
    router.get('/rooms', { date: formatted }, { preserveState: true, replace: true })
    setIsDateOpen(false)
  }

  /* ====================== */
  /* Render */
  /* ====================== */
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Rooms" />

      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Room Management</h1>

          <div className="flex gap-3 items-center">
            <Input
              placeholder="Search room number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />

            {/* DATE PICKER (Popover + Calendar) - same format as Dashboard */}
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-3 w-auto">
                <div className="w-72">
                  <Calendar
                    mode="single"
                    selected={tempDate ?? undefined}
                    onSelect={d => d && setTempDate(d)}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={applyTempDate}>Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">

          {/* ROOM TYPE DROPDOWN */}
          <div className="w-full md:w-60">
            <Select
              value={activeCategory}
              onValueChange={(value) => setActiveCategory(value as Category | "All")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Room Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Quadro">Quadro</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="Rest House">Rest House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* STATUS FILTER BUTTONS */}
          <div className="flex flex-wrap gap-2">
            {(["All","Available","Occupied","Reserved","Cleaning","Maintenance"]  as const).map(status => (
              <Button
                key={status}
                size="sm"
                variant={activeStatus === status ? "default" : "outline"}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>

        </div>

 {/* ROOM CATEGORIES */}
{Object.entries(
  filteredRooms.reduce((acc: Record<string, Item[]>, room) => {
    if (!acc[room.category]) acc[room.category] = []
    acc[room.category].push(room)
    return acc
  }, {})
).map(([category, rooms]) => (
  <div key={category} className="space-y-6">

    {/* CATEGORY TITLE */}
    <h2 className="text-xl font-semibold border-b pb-3">
      {category}
    </h2>

    {/* GRID FOR 1920px */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

      {rooms.map(room => (
        <Dialog key={room.id}>

          <Card className="relative h-48 p-6 flex flex-col justify-between hover:shadow-lg transition text-center">

            {/* EDIT DROPDOWN - TOP RIGHT */}
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-muted transition">
                    <Pencil size={18} />
                  </button>
                </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="w-48">

          {/* ================= OCCUPIED ================= */}
                    {room.status === "Pencil" && (
            <DropdownMenuItem
              onClick={() => {
                router.post(`/rooms/${room.id}/mark-paid`, {}, {
                  preserveScroll: true,
                  onSuccess: () => {
                    router.get('/rooms', { date: selectedDate }, { replace: true })
                  }
                })
              }}
            >
              Mark Paid
            </DropdownMenuItem>
          )}
          {room.status === "Occupied" && (
            <DropdownMenuItem
              onClick={() => {
                router.post(`/rooms/${room.id}/check-out`, {}, {
                  preserveScroll: true,
                  onSuccess: () => {
                    router.get('/rooms', { date: selectedDate }, { replace: true })
                  }
                })
              }}
            >
              Check Out
            </DropdownMenuItem>
          )}

          {/* ================= RESERVED ================= */}
          {room.status === "Reserved" && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  router.post(`/rooms/${room.id}/check-in`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/rooms', { date: selectedDate }, { replace: true })
                    }
                  })
                }}
              >
                Check In
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  router.post(`/rooms/${room.id}/cancel-booking`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/rooms', { date: selectedDate }, { replace: true })
                    }
                  })
                }}
              >
                Cancel Booking
              </DropdownMenuItem>
            </>
          )}

          {/* ================= CLEANING ================= */}
          {room.status === "Cleaning" && (
            <DropdownMenuItem
              onClick={() => {
                router.post(`/rooms/${room.id}/confirm-cleaning`, {}, {
                  preserveScroll: true,
                  onSuccess: () => {
                    router.get('/rooms', { date: selectedDate }, { replace: true })
                  }
                })
              }}
            >
              Confirm Cleaning
            </DropdownMenuItem>
          )}

          {/* ================= AVAILABLE ================= */}
          {room.status === "Available" && (
            <DropdownMenuItem
              onClick={() => {
                router.patch(
                  `/rooms/${room.id}/status`,
                  { status: "maintenance" },
                  {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/rooms', { date: selectedDate }, { replace: true })
                    }
                  }
                )
              }}
            >
              Set Maintenance
            </DropdownMenuItem>
          )}

          {/* ================= MAINTENANCE ================= */}
          {room.status === "Maintenance" && (
            <DropdownMenuItem
              onClick={() => {
                router.patch(
                  `/rooms/${room.id}/status`,
                  { status: "available" },
                  {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/rooms', { date: selectedDate }, { replace: true })
                    }
                  }
                )
              }}
            >
              Set Available
            </DropdownMenuItem>
          )}

        </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* CLICKABLE BODY TO OPEN DETAILS */}
            <DialogTrigger asChild>
              <div className="cursor-pointer flex flex-col justify-between h-full">

                {/* ROOM INFO */}
                <div>
                  <h3 className="text-lg font-semibold">
                    Room {room.roomNumber}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {room.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {room.capacity} Pax
                  </p>
                </div>

                {/* STATUS DISPLAY */}
                <div className="flex justify-center mt-4">
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-medium ${statusColor(room.status)}`}
                  >
                    {room.status}
                  </span>
                </div>

              </div>
            </DialogTrigger>

          </Card>

          {/* ROOM DETAILS DIALOG */}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Room {room.roomNumber}
              </DialogTitle>
              <p className="text-muted-foreground">
                {room.category}
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <p><strong>Capacity:</strong> {room.capacity} Pax</p>
                <p><strong>Beds:</strong> {room.beds}</p>

                <div>
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(room.amenities || []).map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>

        </Dialog>
      ))}

    </div>
  </div>
))}

      </div>
    </AppLayout>
  )
} 