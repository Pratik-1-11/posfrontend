# POS MVP - Feature Roadmap for Nepali Local Marts

## ✅ **IMPLEMENTED FEATURES**

### Core POS
- ✅ Product search with debounce (300ms)
- ✅ Cart management (add, remove, update quantity)
- ✅ Multiple payment methods (Cash, FonePay, eSewa, Card)
- ✅ Thermal receipt printing (80mm)
- ✅ Invoice generation
- ✅ Nepali Date (BS) on receipts
- ✅ NPR currency formatting
- ✅ Keyboard shortcuts (F2: Search, F9: Payment, ESC: Close)
- ✅ Tax calculation (10%)

### Management
- ✅ Dashboard with basic stats
- ✅ Inventory management
- ✅ Product management (CRUD)
- ✅ Expense tracking
- ✅ Reports (Sales, Inventory, Expenses)
- ✅ Store settings (Name, Address, PAN, Phone)
- ✅ User authentication

### Technical
- ✅ React + TypeScript
- ✅ Context API (Auth, Cart, Products, Settings)
- ✅ React Query for data fetching
- ✅ Responsive design

---

## 🔥 **CRITICAL FEATURES (Must Have for Nepal)**

### 1. **Customer Credit Management (Khata System)** - PRIORITY #1
**Why:** 80% of neighborhood marts in Nepal operate on credit for regular customers.
- [ ] Customer database (Name, Phone, Address, Credit Limit)
- [ ] Track credit sales (Udharo)
- [ ] Payment history
- [ ] Outstanding balance alerts
- [ ] Credit report by customer
- [ ] WhatsApp/SMS reminders for pending payments
- [ ] Print khata statement

### 2. **Barcode Scanner Integration** - PRIORITY #2
**Why:** Manual search is too slow during peak hours.
- [ ] USB barcode scanner support
- [ ] Auto-focus on search input
- [ ] Beep sound on scan
- [ ] Generate barcodes for products without them
- [ ] Batch barcode printing

### 3. **Low Stock Alerts** - PRIORITY #3
**Why:** Prevent stockouts of fast-moving items like Wai Wai, oil, rice.
- [ ] Visual alerts on POS screen
- [ ] Configurable minimum stock level per product
- [ ] Low stock report
- [ ] Auto-generate purchase order suggestions

### 4. **Daily Cash Register (Khata Nikasana)** - PRIORITY #4
**Why:** Track opening/closing balance, cash in/out.
- [ ] Opening balance entry
- [ ] Track cash sales vs credit vs digital
- [ ] Cash in/out entries (expenses, withdrawals)
- [ ] Closing balance calculation
- [ ] Daily cash report
- [ ] Variance detection (expected vs actual)

### 5. **Hold Bill / Quick Sale** - PRIORITY #5
**Why:** Handle multiple customers or incomplete transactions.
- [ ] Save incomplete carts
- [ ] Retrieve held bills
- [ ] List of all held bills
- [ ] Auto-clear old held bills (configurable)

---

## 📊 **IMPORTANT FEATURES (Should Have)**

### 6. **Return & Exchange Management**
- [ ] Process returns with original invoice number
- [ ] Exchange products
- [ ] Partial returns
- [ ] Refund tracking
- [ ] Return reason tracking

### 7. **Supplier Management**
- [ ] Supplier database
- [ ] Link products to suppliers
- [ ] Purchase history by supplier
- [ ] Supplier payment tracking
- [ ] Supplier credit management

### 8. **Product Variants**
- [ ] Same product, multiple sizes (e.g., Wai Wai 50g, 100g)
- [ ] Different pricing for variants
- [ ] Stock tracking per variant
- [ ] Variant selection on POS

### 9. **Advanced Reporting**
- [ ] Sales by payment method
- [ ] Sales by category
- [ ] Profit margin report
- [ ] Best/worst selling products
- [ ] Hourly sales report (peak hours)
- [ ] Monthly/yearly comparison

### 10. **Offline Mode**
- [ ] Service Worker for offline caching
- [ ] IndexedDB for local storage
- [ ] Sync when online
- [ ] Offline indicator

### 11. **Print Management**
- [ ] Reprint last bill
- [ ] Reprint by invoice number
- [ ] Print duplicate copy
- [ ] Print kitchen copy (for restaurants)
- [ ] Print size options (80mm, 58mm)

### 12. **Product Category Management**
- [ ] Create/edit/delete categories
- [ ] Assign products to categories
- [ ] Category-based reports
- [ ] Category images/icons

### 13. **User Roles & Permissions**
- [ ] Owner: Full access
- [ ] Cashier: Limited access (no reports, no settings)
- [ ] Manager: Access reports, limited settings
- [ ] Activity log (who did what)

---

## 💡 **NICE TO HAVE FEATURES (Future)**

### 14. **Customer Loyalty Program**
- [ ] Points on purchase
- [ ] Redeem points for discounts
- [ ] Loyalty card/phone number lookup

### 15. **Discount Management**
- [ ] Item-level discounts
- [ ] Cart-level discounts
- [ ] Coupon codes
- [ ] Happy hour pricing
- [ ] Bulk purchase discounts

### 16. **Multi-Store Support**
- [ ] Separate inventory per store
- [ ] Transfer stock between stores
- [ ] Consolidated reports

### 17. **GST/VAT Compliance**
- [ ] VAT-compliant invoices
- [ ] VAT reports
- [ ] Integration with IRD (Inland Revenue Department)

### 18. **Stock Audit**
- [ ] Physical count vs system count
- [ ] Variance report
- [ ] Adjustment entries

### 19. **Expiry Date Tracking**
- [ ] Track expiry dates for perishables
- [ ] Expiry alerts
- [ ] First-expiry-first-out (FEFO)

### 20. **Mobile App**
- [ ] Owner dashboard on mobile
- [ ] Check inventory on mobile
- [ ] View reports on mobile

---

## 🚀 **QUICK WINS (Can Implement Now)**

### A. **Sound Effects**
- Beep on product add
- Success sound on payment
- Error sound on invalid action

### B. **Quick Actions Menu**
- F1: Help/Shortcuts
- F3: Customer search
- F4: Hold current bill
- F5: Retrieve held bill
- F10: End of day report

### C. **Today's Summary Widget**
- Total sales today
- Total cash today
- Total credit today
- Items sold today

### D. **Recent Transactions**
- Show last 5 transactions on POS
- Quick reprint option

### E. **Product Images**
- Show product image in POS
- Faster visual identification

---

## 📋 **IMPLEMENTATION PRIORITY (Next Steps)**

1. **Customer Khata System** (1-2 days)
2. **Barcode Scanner Support** (1 day)
3. **Low Stock Alerts** (1 day)
4. **Hold Bill Feature** (1 day)
5. **Daily Cash Register** (2 days)
6. **Sound Effects** (2 hours)
7. **Quick Actions Menu** (4 hours)
8. **Reprint Last Bill** (2 hours)

---

## 🎯 **FEEDBACK FROM NEPALI MART OWNERS**

Based on conversations with local mart owners in Kathmandu:
- "Khata is more important than cash register"
- "We need to scan barcodes faster"
- "Power cuts are common, need offline mode"
- "Customers forget to pay on time, need SMS reminders"
- "We need to know which products are finishing"
- "Sometimes we need to hold bills when customer goes to ATM"

---

## 🔧 **TECHNICAL IMPROVEMENTS**

- [ ] Add loading skeletons
- [ ] Error boundary components
- [ ] Performance monitoring
- [ ] Analytics integration
- [ ] Automated backups
- [ ] Multi-language support (Nepali + English)
- [ ] Dark mode
- [ ] Print preview before printing
- [ ] Customizable receipt templates
