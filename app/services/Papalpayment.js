import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';

const Paypalpayment = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Thanh toán với PayPal</h1>
      <p>Vui lòng chọn phương thức thanh toán để hoàn tất giao dịch.</p>
      
      {/* PayPal Buttons */}
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: "10.00", // Số tiền thanh toán
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert(`Thanh toán thành công bởi ${details.payer.name.given_name}`);
          });
        }}
        onError={(err) => {
          console.error("Lỗi thanh toán PayPal:", err);
        }}
      />
    </div>
  );
};

export default Paypalpayment;
