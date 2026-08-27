# 📦 myob Synthetic Retail Datasets (INR ₹ Edition)

Pre-generated synthetic supermarket inventory datasets created for benchmarking, stress testing, and simulating retail operations in **`myob`**.

All datasets use Indian retail naming conventions, authentic Indian Rupee (`₹`) wholesale cost & retail price margins, GS1 India EAN-13 barcodes (`890...`), and multi-department distribution.

---

## 📂 Pre-Generated Datasets Available

| Filename | Item Count | File Size | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| [`supermarket_500_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_500_items.csv) | **500** | ~75 KB | Small kiosk / Quick test |
| [`supermarket_1000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_1000_items.csv) | **1,000** | ~150 KB | Local convenience store |
| [`supermarket_2000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_2000_items.csv) | **2,000** | ~300 KB | Standard neighborhood grocer |
| [`supermarket_3000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_3000_items.csv) | **3,000** | ~450 KB | Mid-size supermarket |
| [`supermarket_4000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_4000_items.csv) | **4,000** | ~600 KB | Large multi-aisle supermarket |
| [`supermarket_5000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_5000_items.csv) | **5,000** | ~755 KB | Full department supermarket |
| [`supermarket_10000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_10000_items.csv) | **10,000** | ~1.5 MB | Hypermarket store |
| [`supermarket_50000_items.csv`](file:///home/bimbok/shared/code/working_on/myob/datasets/supermarket_50000_items.csv) | **50,000** | ~7.5 MB | Enterprise chain / Stress testing |

---

## 📋 CSV Data Schema

Every CSV row contains 12 standard columns compatible with the **`myob`** Import wizard:

| Column Header | Type | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `Name` | String | `Desi Kashmiri Saffron Cow Milk 1L` | Procedural product title with variety and size |
| `Brand` | String | `Amul Farms` | Authentic retail brand |
| `SKU` | String | `DAIR-000102` | Department-indexed unique SKU |
| `Barcode` | String | `890100000103` | GS1 India EAN-13 barcode format |
| `Category` | String | `Dairy & Eggs` | One of 9 retail departments |
| `CurrentStock` | Integer | `45` | Current on-hand quantity |
| `Unit` | String | `bottle` | Unit of measure (`kg`, `pcs`, `pack`, `bottle`, etc.) |
| `CostPrice` | Float | `42.50` | Wholesale acquisition cost in INR (₹) |
| `SellingPrice` | Float | `68.00` | Retail selling price in INR (₹) |
| `ExpiryDate` | Date | `2026-09-15` | Batch expiry date (`YYYY-MM-DD`) |
| `Aisle` | String | `Aisle 02` | Physical shelf location |
| `TempZone` | String | `chilled` | Storage requirement (`ambient`, `chilled`, `frozen`) |

---

## ⚡ How to Generate More / Custom Sizes

Run the generator script located in `scripts/generate_datasets.py`:

```bash
# Generate a single custom dataset (e.g. 75,000 items)
python3 scripts/generate_datasets.py --sizes 75000

# Generate multiple sizes
python3 scripts/generate_datasets.py --sizes 1500 8000 25000
```
