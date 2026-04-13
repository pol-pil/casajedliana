import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Rate = {
    id: number;
    name: string;
    value: number;
    type: 'fixed' | 'percentage';
};

type RatesSectionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingRate: Rate | null;
};

export default function RateDialog({ open, onOpenChange, editingRate }: RatesSectionDialogProps) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        value: '',
        type: 'fixed' as 'fixed' | 'percentage',
    });

    useEffect(() => {
        if (editingRate) {
            setData({
                name: editingRate.name,
                value: editingRate.value.toString(),
                type: editingRate.type,
            });
        }
    }, [editingRate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRate) {
            put(`/rates/${editingRate.id}`, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post('/rates', {
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
                    Add Discount
                </Button>
            </DialogTrigger>

            <DialogContent className='max-h-[90vh] min-w-[90vw] overflow-y-auto lg:min-w-md'>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>{editingRate ? 'Edit Discount' : 'New Discount'}</FieldLegend>
                            <FieldSeparator />

                            <Field>
                                <FieldLabel htmlFor='rate-name'>Discount Name</FieldLabel>
                                <Input
                                    id='rate-name'
                                    type='text'
                                    maxLength={100}
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className='text-destructive text-sm'>{errors.name}</p>}
                            </Field>

                            <FieldGroup className='grid grid-cols-2 gap-4'>
                                <Field>
                                    <FieldLabel htmlFor='rate-value'>Value</FieldLabel>
                                    <Input
                                        id='rate-value'
                                        type='number'
                                        step='0.01'
                                        min='0'
                                        required
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                    />
                                    {errors.value && <p className='text-destructive text-sm'>{errors.value}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor='rate-type'>Type</FieldLabel>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value: 'fixed' | 'percentage') => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value='fixed'>Fixed Amount</SelectItem>
                                                <SelectItem value='percentage'>Percentage</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>
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
                            {processing ? 'Saving...' : editingRate ? 'Update Discount' : 'Add Discount'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}