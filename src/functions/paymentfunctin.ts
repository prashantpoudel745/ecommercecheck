import axios from 'axios';

export const initiateEsewaPayment = async (email, planId, amount) => {
  try {
    const response = await axios.post('/api/payment/esewa/initiate', {
      email,
      planId,
      amount
    });

    // Create form and submit to Esewa
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = response.data.paymentUrl;

    Object.entries(response.data.paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

  } catch (error) {
    throw new Error(error.response?.data?.message || 'Payment initiation failed');
  }
};