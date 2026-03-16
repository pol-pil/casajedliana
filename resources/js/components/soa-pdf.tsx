import { Button } from "./ui/button"

export default function SoaPdf({ booking_id }: { booking_id: number }) {
    const openPdf = () => {
        window.open(`/bookings/${booking_id}/print`, '_blank')
    }

    return (
        <Button onClick={openPdf}>Print SOA</Button>
    )
}