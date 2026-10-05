import React, { useMemo } from 'react';
import SharedProductEditor from '../../shared/components/SharedProductEditor';
import { adminService } from '../services/adminService';

const AdminProductEditor = () => {
    const productApi = useMemo(() => ({
        getProduct: adminService.getProductById,
        createProduct: async (formData) => {
            const res = await adminService.createProduct(formData);
            if (res?.success === false) {
                const err = new Error(res?.message || 'Failed to create product');
                err.response = { data: { message: res?.message } };
                throw err;
            }
            return res?.data?.product || res?.product || res?.data?.data?.product;
        },
        updateProduct: async (id, formData) => {
            const res = await adminService.updateProduct(id, formData);
            if (res?.success === false) {
                const err = new Error(res?.message || 'Failed to update product');
                err.response = { data: { message: res?.message } };
                throw err;
            }
            return res;
        }
    }), []);

    const metalPricingApi = useMemo(() => ({
        getMetalPricing: async () => {
            const [metalPricing, taxSettings] = await Promise.all([
                adminService.getMetalPricing(),
                adminService.getTaxSettings()
            ]);

            return {
                ...metalPricing,
                gstRate: taxSettings?.gstRate ?? 0
            };
        }
    }), []);

    return (
        <SharedProductEditor
            productApi={productApi}
            metalPricingApi={metalPricingApi}
            categoryApi={adminService.getCategories}
            editorMode="admin"
            backPath="/admin/products"
        />
    );
};

export default AdminProductEditor;
