import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { motion } from "framer-motion";

const AdminReviews = () => {
  const [filterStars, setFilterStars] = useState<number | undefined>(undefined);
  const [hasComment, setHasComment] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", { stars: filterStars, hasComment }],
    queryFn: async () => {
      const res = await adminApi.getReviews({ stars: filterStars, hasComment });
      return res.data;
    },
    keepPreviousData: true,
  });

  const hideMutation = useMutation({
    mutationFn: ({ id, hide }: any) => adminApi.hideReview(id, hide),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="text-2xl font-bold mb-4">إدارة التقييمات</h1>

        <div className="mb-4 flex gap-2">
          <Input
            placeholder="مثال: 5"
            value={filterStars || ""}
            onChange={(e) =>
              setFilterStars(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
          <select
            className="input"
            onChange={(e) => setHasComment(e.target.value || undefined)}
          >
            <option value="">كل الحالات</option>
            <option value="true">مع تعليق</option>
            <option value="false">بدون تعليق</option>
          </select>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
            }
          >
            تطبيق
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>التعليق</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.reviews?.map((r: any) => (
                <TableRow key={r.reviewId}>
                  <TableCell>{r.clientName || "عميل غير معروف"}</TableCell>
                  <TableCell>{r.rating}/5</TableCell>
                  <TableCell>{r.comment || "—"}</TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          hideMutation.mutate({
                            id: r.reviewId,
                            hide: !r.hidden,
                          })
                        }
                      >
                        {r.hidden ? "إظهار" : "إخفاء"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(r.reviewId)}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminReviews;
