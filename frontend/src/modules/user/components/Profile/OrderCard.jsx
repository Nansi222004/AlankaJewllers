import React, { useState } from 'react';
import { RefreshCw, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../../../../context/ShopContext';
import toast from 'react-hot-toast';
import { ProductThumb } from './ProductThumb';
import ReturnActionModal from './ReturnActionModal';

const formatCurrency = (value, minimumFractionDigits = 0) => (
    `₹${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits
    })}`
);

const OrderCard = ({ order, isExpanded, onToggle }) => {
    const [localShow, setLocalShow] = useState(false);
    const [isActionModalOpen, setActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState('return'); // 'return' or 'exchange'

    const { returns, replacements, refreshReturns, refreshReplacements } = useShop();
    const returnRequest = returns.find(r => String(r.orderId?._id || r.orderId) === String(order.id || order._id));
    const replacementRequest = replacements.find(r => String(r.orderId?._id || r.orderId) === String(order.id || order._id));
    const activeRequest = returnRequest || replacementRequest;
    const requestType = returnRequest ? 'return' : replacementRequest ? 'exchange' : null;

    const showDetails = isExpanded !== undefined ? isExpanded : localShow;
    const setShowDetails = onToggle || setLocalShow;

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = order.subtotal !== undefined ? order.subtotal : items.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 0)), 0);
    const shipping = order.shipping !== undefined ? order.shipping : 0;
    const discount = order.discount !== undefined ? order.discount : 0;
    const giftWrapCharge = order.giftWrapCharge !== undefined ? order.giftWrapCharge : 0;
    const giftCardDiscount = order.giftCardDiscount !== undefined ? order.giftCardDiscount : 0;
    const canRaiseRequest = String(order.status || order.orderStatus || '').trim() === 'Delivered';
    const orderDisplayId = order.displayId || order.orderId || order.id || order._id;
    const orderDisplayShort = String(orderDisplayId || '').replace('ORD-', '');

    const openAction = (type) => {
        if (!canRaiseRequest) {
            toast.error('Return/Exchange is available only after delivery.');
            return;
        }
        setActionType(type);
        setActionModalOpen(true);
    };

    const handleActionSuccess = () => {
        refreshReturns();
        refreshReplacements();
    };

    const getStepStatus = (step) => {
        if (!activeRequest) return 'pending';
        const statusMap = {
            "Pending Approval": 1,
            "Approved": 1,
            "Pickup Scheduled": 2,
            "Pickup Completed": 2,
            "Replacement Shipped": 2,
            "Delivered": 3,
            "Closed": 3,
            "Rejected": 3
        };
        const currentStep = statusMap[activeRequest.status] || 1;
        return currentStep >= step ? 'completed' : 'pending';
    };

    return (
        <div className="md:bg-white md:shadow-sm md:rounded-2xl md:border md:border-gray-100 overflow-hidden font-sans mb-6 md:mb-5">
            <ReturnActionModal isOpen={isActionModalOpen} onClose={() => setActionModalOpen(false)} type={actionType} order={order} onSuccess={handleActionSuccess} />
            {/* Mobile View */}
            <div className="md:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
                        <h4 className="text-sm font-bold text-brand-espresso">#{orderDisplayShort}</h4>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-xs font-medium text-gray-600">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                {activeRequest ? (
                    <div className="bg-brand-pearl p-4 rounded-xl border border-brand-border flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-50 text-brand-champagne p-2 rounded-full">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-brand-espresso capitalize">{requestType} In Progress</h4>
                                <p className="text-[10px] text-gray-500">{new Date(activeRequest.createdAt || activeRequest.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Link
                            to={`/order-tracking/${order.id}`}
                            className="bg-white border border-brand-border text-brand-espresso hover:border-brand-champagne px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                        >
                            Track
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex -space-x-3 overflow-hidden">
                                {items.slice(0, 3).map((item, idx) => (
                                    <ProductThumb
                                        key={idx}
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm"
                                        fallbackClassName="border-gray-100 bg-white"
                                        fallbackIconClassName="w-3 h-3"
                                    />
                                ))}
                                {items.length > 3 && (
                                    <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm">
                                        +{items.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Items</p>
                                <p className="text-xs font-medium text-gray-700">{items.length} {items.length === 1 ? 'Product' : 'Products'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Total</p>
                                <p className="text-sm font-bold text-brand-espresso">{formatCurrency(order.total)}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button className="flex-1 bg-brand-pearl text-brand-espresso py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-brand-border active:scale-95 transition-transform" onClick={() => setShowDetails(!showDetails)}>
                                {showDetails ? 'Close' : 'Details'}
                            </button>
                            <button
                                onClick={() => openAction('return')}
                                disabled={!canRaiseRequest}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border active:scale-95 transition-transform ${canRaiseRequest ? 'bg-brand-pearl text-brand-espresso border-brand-border hover:border-brand-champagne' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                            >
                                Return
                            </button>
                            <button
                                onClick={() => openAction('exchange')}
                                disabled={!canRaiseRequest}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border active:scale-95 transition-transform ${canRaiseRequest ? 'bg-white text-brand-espresso border-stone-200 hover:border-brand-champagne' : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'}`}
                            >
                                Exchange
                            </button>
                            <Link to={`/order-tracking/${order.id}`} className="flex-1 bg-brand-plum text-white border border-brand-plum py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center shadow-md active:scale-95 transition-all hover:bg-brand-champagne hover:text-brand-espresso hover:border-brand-champagne">
                                Track
                            </Link>
                            <Link to={`/order-invoice/${order.id || order._id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-[#702F46] border border-brand-border py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1 hover:border-brand-champagne">
                                <FileText className="w-3 h-3 text-brand-champagne" /> Invoice
                            </Link>
                        </div>
                    </>
                )}

                {/* Mobile Details View (Only if not tracking return, or simplified) */}
                {showDetails && !activeRequest && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3 bg-brand-pearl p-3 rounded-xl border border-brand-champagne/30">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <ProductThumb
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm"
                                        fallbackClassName="bg-white"
                                        fallbackIconClassName="w-4 h-4"
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-[10px] font-bold text-brand-espresso truncate">{item.name}</p>
                                        <p className="text-[10px] text-stone-500">Qty: {item.quantity} • {formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="text-xs font-bold text-brand-espresso">{formatCurrency((item.price || 0) * (item.quantity || 0))}</p>
                                </div>
                            ))}
                            <div className="border-t border-stone-200 pt-2 mt-1 space-y-1 text-[10px]">
                                <div className="flex justify-between text-stone-500"><p>Subtotal</p><p>{formatCurrency(subtotal)}</p></div>
                                {discount > 0 && <div className="flex justify-between text-red-500"><p>Discount</p><p>- {formatCurrency(discount)}</p></div>}
                                {giftWrapCharge > 0 && <div className="flex justify-between text-brand-champagne"><p>Gift Wrap</p><p>+ {formatCurrency(giftWrapCharge)}</p></div>}
                                <div className="flex justify-between text-stone-500"><p>Shipping</p><p>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</p></div>
                                {giftCardDiscount > 0 && <div className="flex justify-between text-emerald-600"><p>Gift Card</p><p>- {formatCurrency(giftCardDiscount)}</p></div>}
                                <div className="flex justify-between font-bold text-brand-espresso pt-1"><p>Grand Total</p><p>{formatCurrency(order.total)}</p></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-4 md:px-6 bg-[#FFF9FA] text-[10px] md:text-sm">
                    <div className="flex flex-wrap gap-4 md:gap-8 text-[#702F46]">
                        <div>
                            <span className="font-bold block text-gray-900">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 mr-1">Order no.:</span>
                            <span className="font-bold text-gray-900">#{orderDisplayShort}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 mr-1">Items:</span>
                            <span className="font-bold text-gray-900">{items.length}</span>
                        </div>
                    </div>
                    <div
                        className="flex items-center gap-1.5 cursor-pointer text-[#702F46] hover:underline font-bold"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <span>{showDetails ? 'Hide' : 'Details'}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showDetails ? 'rotate-90' : ''}`} />
                    </div>
                </div>

                {/* Return Tracker OR Action Buttons */}
                {activeRequest ? (
                    <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-50 p-3 rounded-full border border-amber-200">
                                <RefreshCw className="w-6 h-6 text-brand-champagne animate-spin" />
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-brand-espresso capitalize">{requestType} In Progress</h4>
                                <p className="text-xs text-stone-500">Requested on {new Date(activeRequest.createdAt || activeRequest.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Link
                            to={`/order-tracking/${order.id}`}
                            className="bg-white border border-brand-border text-brand-espresso px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider hover:border-brand-champagne hover:bg-brand-pearl transition-colors"
                        >
                            Track Status
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-end gap-3 p-3 md:p-4 bg-white">
                        <button
                            onClick={() => openAction('return')}
                            disabled={!canRaiseRequest}
                            className={`px-4 md:px-6 py-2 text-[10px] md:text-sm font-bold border rounded-lg uppercase tracking-wider transition-colors ${canRaiseRequest ? 'text-brand-espresso border-brand-border hover:bg-brand-pearl hover:border-brand-champagne' : 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed'}`}
                        >
                            Return
                        </button>
                        <button
                            onClick={() => openAction('exchange')}
                            disabled={!canRaiseRequest}
                            className={`px-4 md:px-6 py-2 text-[10px] md:text-sm font-bold border rounded-lg uppercase tracking-wider transition-colors ${canRaiseRequest ? 'text-brand-espresso border-brand-border hover:bg-brand-pearl hover:border-brand-champagne' : 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed'}`}
                        >
                            Exchange
                        </button>
                        <Link to={`/order-tracking/${order.id}`} className="bg-brand-plum text-white border border-brand-plum px-6 md:px-8 py-2 text-[10px] md:text-sm font-bold rounded-lg uppercase tracking-wider hover:bg-brand-champagne hover:text-brand-espresso hover:border-brand-champagne transition-all shadow-sm flex items-center justify-center">
                            Track Order
                        </Link>
                        <Link to={`/order-invoice/${order.id || order._id}`} target="_blank" rel="noopener noreferrer" className="px-4 md:px-5 py-2 text-[10px] md:text-sm font-bold border border-brand-border text-[#702F46] rounded-lg uppercase tracking-wider hover:border-brand-champagne hover:bg-brand-pearl transition-colors inline-flex items-center gap-1.5 shadow-sm">
                            <FileText className="w-3.5 h-3.5 text-brand-champagne" /> Invoice
                        </Link>
                    </div>
                )}

                {/* Collapsible Section */}
                {showDetails && (
                    <div className="bg-[#FFF9FA] border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Products Reel */}
                        <div className="flex gap-4 md:gap-8 overflow-x-auto p-4 md:p-6 scrollbar-hide">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-32 md:w-48 text-center group">
                                    <div className="relative mb-2 inline-block">
                                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-lg overflow-hidden border border-gray-200 bg-white">
                                            <ProductThumb
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                fallbackClassName="bg-[#FFF9FA]"
                                                fallbackIconClassName="w-5 h-5"
                                            />
                                        </div>
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#702F46] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <h4 className="text-[10px] md:text-xs text-[#702F46] font-medium leading-relaxed line-clamp-2 px-1 h-7 font-serif">{item.name}</h4>
                                    <p className="text-xs md:text-sm font-bold text-[#702F46] mt-1">{formatCurrency(item.price, 2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Total Breakdown Table */}
                        <div className="border-t border-gray-200 mx-6">
                            <div className="py-4 space-y-3 text-sm">
                                <div className="flex justify-between text-[#9A6676]">
                                    <span>Sub total</span>
                                    <span>{formatCurrency(subtotal, 2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-red-500">
                                        <span>Discount</span>
                                        <span>- {formatCurrency(discount, 2)}</span>
                                    </div>
                                )}
                                {giftWrapCharge > 0 && (
                                    <div className="flex justify-between text-brand-champagne">
                                        <span>Gift Wrap</span>
                                        <span>+ {formatCurrency(giftWrapCharge, 2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[#9A6676]">
                                    <span>Shipping cost</span>
                                    <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping, 2)}</span>
                                </div>
                                {giftCardDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Gift Card</span>
                                        <span>- {formatCurrency(giftCardDiscount, 2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Grand Total Bar */}
                <div className="bg-brand-pearl border-t border-brand-border text-brand-espresso p-3.5 md:p-4 md:px-6 flex justify-between items-center text-base md:text-lg font-bold">
                    <span>Grand total</span>
                    <span>{formatCurrency(order.total, 2)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
