import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CompleteServiceDialogProps {
  bookingId: string;
  serviceType: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: {
    workDescription: string;
    cost: number;
    laborCost: number;
    parts: string[];
  }) => Promise<void>;
}

export const CompleteServiceDialog: React.FC<CompleteServiceDialogProps> = ({
  bookingId,
  serviceType,
  customerName,
  open,
  onOpenChange,
  onComplete,
}) => {
  const [workDescription, setWorkDescription] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [parts, setParts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!workDescription || !partsCost) {
      toast.error("يرجى إدخال وصف العمل وتكلفة القطع");
      return;
    }

    const cost = parseFloat(partsCost);
    const labor = parseFloat(laborCost) || 0;
    if (isNaN(cost) || cost < 0) {
      toast.error("يرجى إدخال تكلفة قطع صحيحة");
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        workDescription,
        cost,
        laborCost: labor,
        parts: parts ? parts.split(",").map((p) => p.trim()) : [],
      });

      // Reset form
      setWorkDescription("");
      setPartsCost("");
      setLaborCost("");
      setParts("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setWorkDescription("");
    setPartsCost("");
    setLaborCost("");
    setParts("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right pt-5">
            إنهاء الخدمة وإنشاء الفاتورة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div>
            <h4 className="font-bold mb-2">تفاصيل الخدمة</h4>
            <p className="text-sm text-muted-foreground">{serviceType}</p>
            <p className="text-sm text-muted-foreground">
              العميل: {customerName}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label
                htmlFor="workDescription"
                className="block text-sm font-medium mb-1"
              >
                وصف العمل المنجز
              </Label>
              <Textarea
                id="workDescription"
                className="w-full text-right"
                rows={3}
                placeholder="وصف العمل الذي تم إنجازه..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
              />
            </div>

            <div>
              <Label
                htmlFor="partsCost"
                className="block text-sm font-medium mb-1"
              >
                تكلفة القطع (ج.م)
              </Label>
              <Input
                id="partsCost"
                type="number"
                className="w-full text-right"
                placeholder="0"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
              />
            </div>

            <div>
              <Label
                htmlFor="laborCost"
                className="block text-sm font-medium mb-1"
              >
                أجرة العمل (ج.م)
              </Label>
              <Input
                id="laborCost"
                type="number"
                className="w-full text-right"
                placeholder="0"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="parts" className="block text-sm font-medium mb-1">
                القطع المستخدمة (اختياري)
              </Label>
              <Textarea
                id="parts"
                className="w-full text-right"
                rows={2}
                placeholder="قائمة بالقطع المستخدمة..."
                value={parts}
                onChange={(e) => setParts(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "جاري الإنهاء..." : "إنهاء الخدمة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
