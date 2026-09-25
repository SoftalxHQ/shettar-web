function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

// Rate is a percent: 1.5 means 1.5%, so ₦25,900 becomes a ₦388.50 fee.
export function platformFeeForStay(
  businessAmount: number,
  rate: number,
  mode?: string | null
) {
  const amount = Number(businessAmount);
  const percent = Number(rate);
  if (mode !== 'on_booking' || !Number.isFinite(percent) || percent <= 0 || !Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return roundMoney((amount * percent) / 100);
}

export function guestNightlyPrice(room?: { price?: number | string; guest_price?: number | string } | null) {
  const guest = Number(room?.guest_price);
  if (Number.isFinite(guest) && guest > 0) return guest;
  return Number(room?.price) || 0;
}

export function guestOldPrice(room?: { old_price?: number | string; guest_old_price?: number | string } | null) {
  const guest = Number(room?.guest_old_price);
  if (Number.isFinite(guest) && guest > 0) return guest;
  return Number(room?.old_price) || 0;
}

export function guestCheckout(opts: {
  roomPrice: number;
  nights: number;
  rooms: number;
  promoDiscount?: number;
  fundedBy?: string | null;
  commissionRate?: number | null;
  commissionMode?: string | null;
}) {
  const roomPrice = Number(opts.roomPrice);
  const nights = Number(opts.nights);
  const rooms = Number(opts.rooms);
  const roomCharges = roundMoney(
    (Number.isFinite(roomPrice) ? roomPrice : 0) *
    (Number.isFinite(nights) && nights > 0 ? nights : 1) *
    (Number.isFinite(rooms) && rooms > 0 ? rooms : 1)
  );
  const discount = Number(opts.promoDiscount) || 0;
  const businessOwed = opts.fundedBy === 'platform' ? roomCharges : Math.max(0, roomCharges - discount);
  const platformFee = platformFeeForStay(
    businessOwed,
    Number(opts.commissionRate || 0),
    opts.commissionMode
  );
  const payable = roundMoney(Math.max(0, roomCharges - discount) + platformFee);
  return { roomCharges, platformFee, payable };
}
