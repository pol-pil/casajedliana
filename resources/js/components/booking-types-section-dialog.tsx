import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type BookingType = {
    id: number;
    name: string;
};

type BookingTypesSectionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingBookingType: BookingType | null;
};

export default function BookingTypeDialog({ open, onOpenChange, editingBookingType }: BookingTypesSectionDialogProps) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
    });

    useEffect(() => {
        if (editingBookingType) {
            setData({ name: editingBookingType.name });
        }
    }, [editingBookingType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBookingType) {
            put(`/booking-types/${editingBookingType.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post('/booking-types', {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) reset();
                onOpenChange(open);
            }}
        >
            <DialogTrigger asChild>
                <Button className='flex items-center'>
                    <Plus className='size-4' />
                    Add Booking Type
                </Button>
            </DialogTrigger>

            <DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md dark:bg-primary-foreground/80 backdrop-blur-xs'>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>{editingBookingType ? 'Edit Booking Type' : 'New Booking Type'}</FieldLegend>
                            <FieldSeparator />
                            <Field>
                                <FieldLabel htmlFor='booking-type-name'>Booking Type Name</FieldLabel>
                                <Input
                                    id='booking-type-name'
                                    type='text'
                                    maxLength={100}
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className='text-destructive text-sm'>{errors.name}</p>}
                            </Field>
                        </FieldSet>
                    </FieldGroup>

                    <FieldSeparator className='py-8' />

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline'>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={processing}>
                            {processing ? 'Saving...' : editingBookingType ? 'Update Booking Type' : 'Add Booking Type'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}