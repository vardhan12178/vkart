import React, { forwardRef } from "react";
import {
  ArrowLeft, ArrowRight, Building2, Camera, Check, ChevronDown, ChevronRight, CircleCheck,
  CircleX, ClipboardList, Clock, CreditCard, Crown, FileDown, Globe, Headset,
  Heart, House, Info, Landmark, Lock, LogOut, Mail, Mailbox,
  MapPin, Minus, Package, PackageOpen, Pencil, Phone, Plane, Plus,
  QrCode, Receipt, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Tag, Trash2,
  Truck, Undo2, User, X,
} from "lucide-react";

// Lucide icons for the account pages, sized like text (1em) so they line up with the
// font-size classes those pages already use. Pass size to override.
const em = (Icon, name) => {
  const Sized = forwardRef(({ size = "1em", strokeWidth = 2, ...props }, ref) => (
    <Icon ref={ref} size={size} strokeWidth={strokeWidth} aria-hidden={props["aria-label"] ? undefined : true} {...props} />
  ));
  Sized.displayName = name;
  return Sized;
};

export const ArrowLeftIcon = em(ArrowLeft, "ArrowLeftIcon");
export const ArrowRightIcon = em(ArrowRight, "ArrowRightIcon");
export const Building2Icon = em(Building2, "Building2Icon");
export const CameraIcon = em(Camera, "CameraIcon");
export const CheckIcon = em(Check, "CheckIcon");
export const ChevronDownIcon = em(ChevronDown, "ChevronDownIcon");
export const ChevronRightIcon = em(ChevronRight, "ChevronRightIcon");
export const CircleCheckIcon = em(CircleCheck, "CircleCheckIcon");
export const CircleXIcon = em(CircleX, "CircleXIcon");
export const ClipboardListIcon = em(ClipboardList, "ClipboardListIcon");
export const ClockIcon = em(Clock, "ClockIcon");
export const CreditCardIcon = em(CreditCard, "CreditCardIcon");
export const CrownIcon = em(Crown, "CrownIcon");
export const FileDownIcon = em(FileDown, "FileDownIcon");
export const GlobeIcon = em(Globe, "GlobeIcon");
export const HeadsetIcon = em(Headset, "HeadsetIcon");
export const HeartIcon = em(Heart, "HeartIcon");
export const HouseIcon = em(House, "HouseIcon");
export const InfoIcon = em(Info, "InfoIcon");
export const LandmarkIcon = em(Landmark, "LandmarkIcon");
export const LockIcon = em(Lock, "LockIcon");
export const LogOutIcon = em(LogOut, "LogOutIcon");
export const MailIcon = em(Mail, "MailIcon");
export const MailboxIcon = em(Mailbox, "MailboxIcon");
export const MapPinIcon = em(MapPin, "MapPinIcon");
export const MinusIcon = em(Minus, "MinusIcon");
export const PackageIcon = em(Package, "PackageIcon");
export const PackageOpenIcon = em(PackageOpen, "PackageOpenIcon");
export const PencilIcon = em(Pencil, "PencilIcon");
export const PhoneIcon = em(Phone, "PhoneIcon");
export const PlaneIcon = em(Plane, "PlaneIcon");
export const PlusIcon = em(Plus, "PlusIcon");
export const QrCodeIcon = em(QrCode, "QrCodeIcon");
export const ReceiptIcon = em(Receipt, "ReceiptIcon");
export const SettingsIcon = em(Settings, "SettingsIcon");
export const ShieldCheckIcon = em(ShieldCheck, "ShieldCheckIcon");
export const ShoppingBagIcon = em(ShoppingBag, "ShoppingBagIcon");
export const ShoppingCartIcon = em(ShoppingCart, "ShoppingCartIcon");
export const TagIcon = em(Tag, "TagIcon");
export const Trash2Icon = em(Trash2, "Trash2Icon");
export const TruckIcon = em(Truck, "TruckIcon");
export const Undo2Icon = em(Undo2, "Undo2Icon");
export const UserIcon = em(User, "UserIcon");
export const XIcon = em(X, "XIcon");
