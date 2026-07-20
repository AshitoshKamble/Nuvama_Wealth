import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, Plus, CheckCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Address, PaymentMethod, ShippingAddress } from '../lib/types';

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      setSelectedAddress(data[0] || null);
    }
    setLoading(false);
  };

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!newAddress.name) errors.name = 'Name is required';
    if (!newAddress.phone) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(newAddress.phone)) errors.phone = 'Invalid phone number';
    if (!newAddress.address_line1) errors.address_line1 = 'Address is required';
    if (!newAddress.city) errors.city = 'City is required';
    if (!newAddress.state) errors.state = 'State is required';
    if (!newAddress.pincode) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(newAddress.pincode)) errors.pincode = 'Invalid pincode';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateAddress() || !user) return;

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) {
      showToast('Failed to add address', 'error');
      return;
    }

    setAddresses((prev) => [...prev, data]);
    setSelectedAddress(data);
    setShowAddressModal(false);
    setNewAddress({
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
    });
    showToast('Address added', 'success');
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || cartItems.length === 0) return;

    setPlacing(true);

    const orderNumber = await supabase.rpc('generate_order_number');

    const shippingAddress: ShippingAddress = {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      address_line1: selectedAddress.address_line1,
      address_line2: selectedAddress.address_line2,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: (orderNumber.data as string) || `SHT${Date.now()}`,
        status: 'pending',
        total_amount: cartTotal,
        subtotal: cartTotal,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'COD' ? 'pending' : 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      showToast('Failed to place order', 'error');
      setPlacing(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: (item.product as any)?.price || 0,
      product_snapshot: {
        name: (item.product as any)?.name,
        description: (item.product as any)?.description,
        image_url: (item.product as any)?.image_url,
        size: (item.product as any)?.size,
        color: (item.product as any)?.color,
      },
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      showToast('Failed to create order items', 'error');
      setPlacing(false);
      return;
    }

    const { error: deliveryError } = await supabase.from('deliveries').insert({
      order_id: order.id,
      status: 'processing',
      carrier: 'In-house Logistics',
      estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    });

    if (!deliveryError) {
      const { data: delivery } = await supabase
        .from('deliveries')
        .select('id')
        .eq('order_id', order.id)
        .single();

      if (delivery) {
        await supabase.from('delivery_events').insert({
          delivery_id: delivery.id,
          status: 'processing',
          location: 'Warehouse',
          description: 'Order received and being processed',
        });
      }
    }

    await clearCart();

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Order Placed',
      message: `Your order #${order.order_number} has been placed successfully.`,
      type: 'order',
      reference_id: order.id,
      reference_type: 'order',
    });

    setPlacing(false);
    showToast('Order placed successfully!', 'success');
    navigate(`/orders/${order.id}`);
  };

  const subtotal = cartTotal;
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header title="Checkout" showBack backTo="/cart" />

      <div className="p-4 space-y-4">
        {/* Delivery Address */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium text-gray-900">Delivery Address</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-sm text-link"
            >
              Add New
            </button>
          </div>

          {selectedAddress ? (
            <Card
              onClick={() => {}}
              className="border-primary-500 bg-primary-50/50"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedAddress.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {selectedAddress.address_line1}
                    {selectedAddress.address_line2 && `, ${selectedAddress.address_line2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.city}, {selectedAddress.state} -{' '}
                    {selectedAddress.pincode}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {selectedAddress.phone}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-primary-500" />
              </div>
            </Card>
          ) : (
            <Card
              onClick={() => setShowAddressModal(true)}
              hoverable
              className="flex items-center justify-center py-6"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Add delivery address</p>
              </div>
            </Card>
          )}
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-medium text-gray-900 mb-2">Payment Method</h2>
          <Card>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                  paymentMethod === 'UPI' ? 'bg-primary-50' : ''
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'UPI'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'UPI' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">UPI Payment</p>
                  <p className="text-xs text-gray-500">Pay via UPI apps</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('COD')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                  paymentMethod === 'COD' ? 'bg-primary-50' : ''
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD'
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'COD' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-secondary-600">COD</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive</p>
                </div>
              </button>
            </div>
          </Card>
        </section>

        {/* Order Summary */}
        <section>
          <h2 className="font-medium text-gray-900 mb-2">Order Summary</h2>
          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-secondary-600">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handlePlaceOrder}
            loading={placing}
            disabled={!selectedAddress || cartItems.length === 0}
            className="w-full"
          >
            Place Order
          </Button>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Address"
        size="lg"
      >
        <div className="space-y-3">
          <Input
            label="Full Name"
            value={newAddress.name}
            onChange={(e) =>
              setNewAddress({ ...newAddress, name: e.target.value })
            }
            error={addressErrors.name}
            placeholder="John Doe"
          />
          <Input
            label="Phone Number"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress({ ...newAddress, phone: e.target.value })
            }
            error={addressErrors.phone}
            placeholder="10-digit mobile number"
            type="tel"
          />
          <Input
            label="Address Line 1"
            value={newAddress.address_line1}
            onChange={(e) =>
              setNewAddress({ ...newAddress, address_line1: e.target.value })
            }
            error={addressErrors.address_line1}
            placeholder="House/Flat No., Building Name"
          />
          <Input
            label="Address Line 2 (Optional)"
            value={newAddress.address_line2}
            onChange={(e) =>
              setNewAddress({ ...newAddress, address_line2: e.target.value })
            }
            placeholder="Street, Locality"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              error={addressErrors.city}
              placeholder="City"
            />
            <Input
              label="State"
              value={newAddress.state}
              onChange={(e) =>
                setNewAddress({ ...newAddress, state: e.target.value })
              }
              error={addressErrors.state}
              placeholder="State"
            />
          </div>
          <Input
            label="Pincode"
            value={newAddress.pincode}
            onChange={(e) =>
              setNewAddress({ ...newAddress, pincode: e.target.value })
            }
            error={addressErrors.pincode}
            placeholder="6-digit pincode"
            type="tel"
            maxLength={6}
          />

          <Button onClick={handleAddAddress} className="w-full mt-4">
            Save Address
          </Button>
        </div>
      </Modal>
    </div>
  );
}
