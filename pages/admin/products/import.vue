<template>
  <div class="max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/products" class="text-zinc-400 hover:text-zinc-700 transition-colors p-1 -ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-base font-bold text-zinc-900">Import Products from Excel</h1>
        <p class="text-xs text-zinc-400 mt-0.5">Upload up to 500 products at once using a spreadsheet</p>
      </div>
    </div>

    <!-- Format guide -->
    <div class="card overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
        @click="guideOpen = !guideOpen"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-zinc-800">Spreadsheet Format Guide</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 transition-transform shrink-0" :class="{ 'rotate-180': guideOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="guideOpen" class="border-t border-zinc-100 px-5 pb-5 pt-4 space-y-4">
        <p class="text-sm text-zinc-600 leading-relaxed">
          Your spreadsheet must have a <strong>header row</strong> in row 1 with the exact column names listed below.
          The first sheet in the workbook will be imported. Accepted formats: <strong>.xlsx</strong> and <strong>.xls</strong>.
        </p>

        <!-- Spreadsheet preview -->
        <div>
          <p class="text-xs font-semibold text-zinc-600 mb-2">How your spreadsheet should look</p>
          <div class="overflow-x-auto rounded-xl border border-zinc-200">
            <table class="text-[11px] border-collapse" style="min-width: max-content">
              <thead>
                <tr>
                  <th class="sticky left-0 z-10 bg-zinc-100 border-r border-b border-zinc-300 px-2.5 py-1.5 text-zinc-400 font-semibold w-8 text-center">#</th>
                  <th
                    v-for="col in COLUMNS"
                    :key="col.name"
                    class="border-r border-b border-zinc-300 px-2.5 py-1.5 font-mono font-semibold whitespace-nowrap text-left"
                    :class="col.required ? 'bg-brand-50 text-brand-700' : 'bg-zinc-100 text-zinc-600'"
                  >
                    {{ col.name }}
                    <span v-if="col.required" class="ml-1 text-brand-400">*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in DEMO_ROWS" :key="i" class="hover:bg-zinc-50/60">
                  <td class="sticky left-0 z-10 bg-zinc-50 border-r border-b border-zinc-200 px-2.5 py-1.5 text-zinc-400 font-semibold text-center">{{ i + 2 }}</td>
                  <td
                    v-for="col in COLUMNS"
                    :key="col.name"
                    class="border-r border-b border-zinc-100 px-2.5 py-1.5 whitespace-nowrap max-w-[180px] truncate"
                    :class="row[col.name] !== '' && row[col.name] != null ? 'text-zinc-800' : 'text-zinc-300'"
                  >
                    {{ row[col.name] !== '' && row[col.name] != null ? row[col.name] : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-zinc-400 mt-1.5">Columns marked <span class="text-brand-600 font-semibold">blue *</span> are required. Scroll right to see all columns.</p>
        </div>

        <!-- Column table -->
        <div class="overflow-x-auto rounded-xl border border-zinc-200">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200">
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-600 whitespace-nowrap">Column name</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-600">Required?</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-600">Type</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-600 min-w-[160px]">Description</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-600 min-w-[120px]">Example</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="col in COLUMNS" :key="col.name" class="hover:bg-zinc-50/50 transition-colors">
                <td class="px-3 py-2.5 font-mono text-[11px] text-zinc-800 whitespace-nowrap font-semibold">{{ col.name }}</td>
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                    :class="col.required ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-zinc-100 text-zinc-500'"
                  >
                    {{ col.required ? 'Required' : 'Optional' }}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-zinc-500 whitespace-nowrap">{{ col.type }}</td>
                <td class="px-3 py-2.5 text-zinc-600 leading-relaxed">{{ col.desc }}</td>
                <td class="px-3 py-2.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">{{ col.example }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 space-y-1.5">
          <p class="text-xs font-semibold text-amber-800">Important notes</p>
          <ul class="text-xs text-amber-700 space-y-1 list-disc list-inside leading-relaxed">
            <li>Maximum <strong>500 products</strong> per import file.</li>
            <li><strong>imageUrl</strong> is optional — leave blank and add the image later from the product edit page.</li>
            <li>For <strong>categoryId</strong>, use the numeric ID from your categories list. Leave blank to skip category.</li>
            <li><strong>isFeatured</strong>: use <code class="bg-amber-100 px-1 rounded">true</code> / <code class="bg-amber-100 px-1 rounded">false</code>, or <code class="bg-amber-100 px-1 rounded">yes</code> / <code class="bg-amber-100 px-1 rounded">no</code>, or <code class="bg-amber-100 px-1 rounded">1</code> / <code class="bg-amber-100 px-1 rounded">0</code>.</li>
            <li><strong>expiryDate</strong>: use format <code class="bg-amber-100 px-1 rounded">YYYY-MM-DD</code> (e.g. 2026-12-31).</li>
            <li>If any row has an error the entire import is rejected — fix all errors and re-upload.</li>
          </ul>
        </div>

        <!-- Categories reference -->
        <div>
          <p class="text-xs font-semibold text-zinc-600 mb-2">Your categories (for categoryId column)</p>
          <div v-if="categoriesLoading" class="text-xs text-zinc-400">Loading…</div>
          <div v-else-if="!categories.length" class="text-xs text-zinc-400">No categories yet.</div>
          <div v-else class="flex flex-wrap gap-2">
            <span
              v-for="cat in categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg"
            >
              <span class="font-mono font-bold text-zinc-500">{{ cat.id }}</span>
              {{ cat.name }}
            </span>
          </div>
        </div>

        <button
          class="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          @click="downloadTemplate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download template (.xlsx)
        </button>
      </div>
    </div>

    <!-- Upload area -->
    <div v-if="!previewRows.length" class="card p-6 space-y-4">
      <h2 class="text-sm font-semibold text-zinc-700">Upload your file</h2>

      <div
        class="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-6 transition-colors cursor-pointer"
        :class="dragOver ? 'border-brand-400 bg-brand-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <div class="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-zinc-700 mb-1">Drop your Excel file here</p>
        <p class="text-xs text-zinc-400">or click to browse — .xlsx or .xls, max 500 rows</p>
      </div>
      <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />

      <div v-if="uploadError" class="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
        <p class="text-sm font-semibold text-red-700 mb-1">Upload error</p>
        <p class="text-xs text-red-600">{{ uploadError }}</p>
      </div>
    </div>

    <!-- Preview + validation results -->
    <template v-if="previewRows.length || rowErrors.length">
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold text-zinc-900">
              {{ rowErrors.length ? 'Validation errors found' : `${previewRows.length} product${previewRows.length !== 1 ? 's' : ''} ready to import` }}
            </p>
            <p class="text-xs text-zinc-400 mt-0.5">
              {{ rowErrors.length ? 'Fix the errors in your file and re-upload.' : 'Review the products below, then click Import.' }}
            </p>
          </div>
          <button class="text-xs text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1" @click="reset">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>

        <!-- Errors -->
        <div v-if="rowErrors.length" class="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
          <div v-for="err in rowErrors" :key="err.row" class="px-5 py-3 flex items-start gap-3">
            <span class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">!</span>
            <div>
              <p class="text-xs font-semibold text-zinc-800">Row {{ err.row }} — {{ err.name }}</p>
              <ul class="mt-0.5 space-y-0.5">
                <li v-for="(e, i) in err.errors" :key="i" class="text-xs text-red-600">{{ e }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Preview table -->
        <div v-else class="overflow-x-auto max-h-96">
          <table class="w-full text-xs">
            <thead class="bg-zinc-50 sticky top-0">
              <tr class="border-b border-zinc-200">
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500 whitespace-nowrap">#</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Name</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Price</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Stock</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Brand</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Category</th>
                <th class="text-left px-3 py-2.5 font-semibold text-zinc-500">Featured</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              <tr v-for="(row, i) in previewRows" :key="i" class="hover:bg-zinc-50/50">
                <td class="px-3 py-2 text-zinc-400">{{ i + 1 }}</td>
                <td class="px-3 py-2 font-medium text-zinc-900 max-w-[200px] truncate">{{ row.name }}</td>
                <td class="px-3 py-2 text-zinc-700 whitespace-nowrap">ETB {{ Number(row.price).toFixed(2) }}</td>
                <td class="px-3 py-2 text-zinc-700">{{ row.stock }}</td>
                <td class="px-3 py-2 text-zinc-500 max-w-[120px] truncate">{{ row.brand || '—' }}</td>
                <td class="px-3 py-2 text-zinc-500">{{ row.categoryId || '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="row.isFeatured" class="text-brand-600 font-semibold">★ Yes</span>
                  <span v-else class="text-zinc-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Import action -->
      <div v-if="!rowErrors.length" class="flex items-center gap-3 justify-end">
        <button class="btn-secondary text-sm" @click="reset">Cancel</button>
        <button
          class="btn-primary text-sm px-6 flex items-center gap-2"
          :disabled="importing"
          @click="doImport"
        >
          <svg v-if="importing" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ importing ? `Importing ${previewRows.length} products…` : `Import ${previewRows.length} products` }}
        </button>
      </div>
    </template>

    <!-- Success state -->
    <div v-if="importedCreated > 0 || importedUpdated > 0" class="card p-8 text-center space-y-4">
      <div class="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p class="text-base font-bold text-zinc-900">Import complete</p>
        <p class="text-sm text-zinc-500 mt-1">
          <template v-if="importedCreated > 0">{{ importedCreated }} product{{ importedCreated !== 1 ? 's' : '' }} added</template>
          <template v-if="importedCreated > 0 && importedUpdated > 0"> · </template>
          <template v-if="importedUpdated > 0">{{ importedUpdated }} updated by SKU</template>
        </p>
      </div>
      <div class="flex items-center gap-3 justify-center">
        <button class="btn-secondary text-sm" @click="importedCreated = 0; importedUpdated = 0; reset()">Import more</button>
        <NuxtLink to="/admin/products" class="btn-primary text-sm">View products</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const adminStore = useAdminStore()

const guideOpen = ref(true)
const dragOver = ref(false)
const fileInput = ref(null)
const uploadError = ref(null)

const previewRows = ref([])
const rowErrors = ref([])
const selectedFile = ref(null)
const importing = ref(false)
const importedCreated = ref(0)
const importedUpdated = ref(0)
const importedCount = computed(() => importedCreated.value + importedUpdated.value)

// Categories for reference
const categories = ref([])
const categoriesLoading = ref(true)

onMounted(async () => {
  try {
    const res = await $fetch('/api/categories')
    categories.value = res
  } catch { /* silent */ }
  finally { categoriesLoading.value = false }
})

const COLUMNS = [
  { name: 'name',                required: true,  type: 'Text',    desc: 'Product name',                           example: 'Coconut Oil 500ml' },
  { name: 'sku',                 required: false, type: 'Text',    desc: 'Unique product code. Re-importing a file updates existing products with matching SKU instead of creating duplicates.', example: 'COCONUT-500ML' },
  { name: 'price',               required: true,  type: 'Number',  desc: 'Selling price in ETB (must be > 0)',     example: '89.99' },
  { name: 'imageUrl',            required: false, type: 'URL',     desc: 'Primary product image (public URL). Can be added later in the edit page.', example: 'https://res.cloudinary.com/…' },
  { name: 'stock',               required: false, type: 'Integer', desc: 'Current stock quantity. Defaults to 0', example: '150' },
  { name: 'description',         required: false, type: 'Text',    desc: 'Product description / details',         example: 'Cold-pressed organic oil…' },
  { name: 'brand',               required: false, type: 'Text',    desc: 'Brand name',                            example: 'Naturals Co.' },
  { name: 'unit',                required: false, type: 'Text',    desc: 'Unit label shown next to price',        example: 'per bottle' },
  { name: 'weight',              required: false, type: 'Text',    desc: 'Weight or volume text',                 example: '500ml' },
  { name: 'categoryId',          required: false, type: 'Integer', desc: 'Category ID from the list above',       example: '3' },
  { name: 'costPrice',           required: false, type: 'Number',  desc: 'Cost/purchase price (admin only)',      example: '55.00' },
  { name: 'lowStockThreshold',   required: false, type: 'Integer', desc: 'Alert when stock falls below this. Default 10', example: '20' },
  { name: 'isFeatured',          required: false, type: 'Boolean', desc: 'Show in Featured section. true/false',  example: 'true' },
  { name: 'countryOfOrigin',     required: false, type: 'Text',    desc: 'Country where product is made',        example: 'Ethiopia' },
  { name: 'storageInstructions', required: false, type: 'Text',    desc: 'Storage / handling notes',             example: 'Keep refrigerated' },
  { name: 'expiryDate',          required: false, type: 'Date',    desc: 'Expiry date in YYYY-MM-DD format',     example: '2026-12-31' },
  { name: 'image2Url',           required: false, type: 'URL',     desc: 'Second product image URL',             example: 'https://…' },
  { name: 'image3Url',           required: false, type: 'URL',     desc: 'Third product image URL',              example: 'https://…' },
  { name: 'image4Url',           required: false, type: 'URL',     desc: 'Fourth product image URL',             example: 'https://…' },
]

const DEMO_ROWS = [
  { name: 'Coconut Oil 500ml', sku: 'COCONUT-500ML', price: 89.99, imageUrl: '', stock: 150, description: 'Cold-pressed organic coconut oil', brand: 'Naturals Co.', unit: 'per bottle', weight: '500ml', categoryId: '', costPrice: 55, lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep in a cool dry place', expiryDate: '2027-06-30', image2Url: '', image3Url: '', image4Url: '' },
  { name: 'Whole Wheat Bread', sku: 'BREAD-WW-400G', price: 35, imageUrl: '', stock: 80, description: 'Freshly baked whole wheat loaf', brand: 'Jam Bakery', unit: 'per loaf', weight: '400g', categoryId: '', costPrice: '', lowStockThreshold: 15, isFeatured: 'true', countryOfOrigin: 'Ethiopia', storageInstructions: 'Consume within 3 days', expiryDate: '', image2Url: '', image3Url: '', image4Url: '' },
]

function downloadTemplate() {
  import('xlsx').then((mod) => {
    const XLSX = mod.default ?? mod

    const headers = COLUMNS.map((c) => c.name)
    const sampleProducts = [
      { name: 'Coconut Oil 500ml',       sku: 'COCONUT-500ML',   price: 89.99, stock: 150, description: 'Cold-pressed organic coconut oil',      brand: 'Naturals Co.',   unit: 'per bottle', weight: '500ml',  categoryId: '',  costPrice: 55,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep in a cool dry place',  expiryDate: '2027-06-30' },
      { name: 'Whole Wheat Bread',        sku: 'BREAD-WW-400G',   price: 35,    stock: 80,  description: 'Freshly baked whole wheat loaf',         brand: 'Jam Bakery',     unit: 'per loaf',   weight: '400g',   categoryId: '',  costPrice: '',  lowStockThreshold: 15, isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Consume within 3 days',      expiryDate: '' },
      { name: 'Full Cream Milk 1L',       sku: 'MILK-FC-1L',      price: 52,    stock: 200, description: 'Fresh pasteurised full cream milk',      brand: 'Mama Dairy',     unit: 'per litre',  weight: '1L',     categoryId: '',  costPrice: 38,  lowStockThreshold: 30, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep refrigerated',           expiryDate: '2026-06-10' },
      { name: 'White Rice 5kg',           sku: 'RICE-WHT-5KG',    price: 220,   stock: 100, description: 'Long-grain white rice, washed and clean', brand: 'Alem Foods',    unit: 'per bag',    weight: '5kg',    categoryId: '',  costPrice: 170, lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a dry place',        expiryDate: '' },
      { name: 'Sunflower Oil 1L',         sku: 'OIL-SF-1L',       price: 95,    stock: 120, description: 'Refined sunflower cooking oil',          brand: 'Zer Oil',        unit: 'per bottle', weight: '1L',     categoryId: '',  costPrice: 70,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep away from heat',         expiryDate: '2027-01-01' },
      { name: 'Pasta Spaghetti 500g',     sku: 'PASTA-SPG-500G',  price: 28,    stock: 300, description: 'Durum wheat spaghetti, 7-min cook time', brand: 'Genet Pasta',   unit: 'per pack',   weight: '500g',   categoryId: '',  costPrice: 18,  lowStockThreshold: 25, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a cool dry place',   expiryDate: '2028-03-01' },
      { name: 'Tomato Paste 200g',        sku: 'TPASTE-200G',     price: 18,    stock: 250, description: 'Concentrated tomato paste, no additives', brand: 'Red Gold',      unit: 'per can',    weight: '200g',   categoryId: '',  costPrice: 11,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Refrigerate after opening',   expiryDate: '2027-08-15' },
      { name: 'Eggs Tray (30)',           sku: 'EGGS-TRAY-30',    price: 180,   stock: 60,  description: 'Fresh farm eggs, 30 per tray',           brand: 'Zema Farm',      unit: 'per tray',   weight: '1.8kg',  categoryId: '',  costPrice: 140, lowStockThreshold: 10, isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep refrigerated',           expiryDate: '2026-06-15' },
      { name: 'Lentils Red 1kg',          sku: 'LENTIL-RED-1KG',  price: 45,    stock: 180, description: 'Split red lentils, quick-cooking',       brand: 'Alem Foods',     unit: 'per pack',   weight: '1kg',    categoryId: '',  costPrice: 30,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in an airtight container', expiryDate: '' },
      { name: 'Bottled Water 600ml',      sku: 'WATER-600ML',     price: 8,     stock: 500, description: 'Natural mineral water',                  brand: 'Abyssinia',      unit: 'per bottle', weight: '600ml',  categoryId: '',  costPrice: 4,   lowStockThreshold: 50, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep away from direct sunlight', expiryDate: '2028-01-01' },
      { name: 'Sugar 2kg',                sku: 'SUGAR-2KG',       price: 75,    stock: 150, description: 'Refined white sugar',                    brand: 'Wonji Sugar',    unit: 'per bag',    weight: '2kg',    categoryId: '',  costPrice: 55,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep dry',                     expiryDate: '' },
      { name: 'Salt Iodised 1kg',         sku: 'SALT-IOD-1KG',    price: 12,    stock: 400, description: 'Iodised table salt',                     brand: 'Assale',         unit: 'per pack',   weight: '1kg',    categoryId: '',  costPrice: 7,   lowStockThreshold: 30, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep dry',                     expiryDate: '' },
      { name: 'Teff Flour 2kg',           sku: 'TEFF-FL-2KG',     price: 110,   stock: 90,  description: 'Whole-grain teff flour for injera',      brand: 'Alem Foods',     unit: 'per bag',    weight: '2kg',    categoryId: '',  costPrice: 80,  lowStockThreshold: 10, isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a dry place',         expiryDate: '' },
      { name: 'Butter 250g',              sku: 'BUTTER-250G',     price: 68,    stock: 70,  description: 'Unsalted pasteurised butter',            brand: 'Mama Dairy',     unit: 'per block',  weight: '250g',   categoryId: '',  costPrice: 48,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep refrigerated',            expiryDate: '2026-07-01' },
      { name: 'Yoghurt Plain 500g',       sku: 'YOGHURT-500G',    price: 42,    stock: 80,  description: 'Creamy plain yoghurt, no sugar added',   brand: 'Mama Dairy',     unit: 'per cup',    weight: '500g',   categoryId: '',  costPrice: 28,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep refrigerated',            expiryDate: '2026-06-08' },
      { name: 'Chicken Breast 1kg',       sku: 'CHKN-BRST-1KG',  price: 230,   stock: 40,  description: 'Fresh boneless chicken breast',          brand: 'Zema Farm',      unit: 'per kg',     weight: '1kg',    categoryId: '',  costPrice: 180, lowStockThreshold: 5,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep frozen',                  expiryDate: '2026-06-07' },
      { name: 'Onions 1kg',               sku: 'ONION-1KG',       price: 22,    stock: 200, description: 'Fresh red onions',                       brand: '',               unit: 'per kg',     weight: '1kg',    categoryId: '',  costPrice: 14,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a cool dry place',   expiryDate: '' },
      { name: 'Tomatoes 1kg',             sku: 'TOMATO-1KG',      price: 25,    stock: 150, description: 'Fresh ripe tomatoes',                    brand: '',               unit: 'per kg',     weight: '1kg',    categoryId: '',  costPrice: 16,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep at room temperature',    expiryDate: '' },
      { name: 'Green Pepper 500g',        sku: 'PEPPER-GRN-500G', price: 20,    stock: 120, description: 'Fresh green bell peppers',               brand: '',               unit: 'per pack',   weight: '500g',   categoryId: '',  costPrice: 12,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep refrigerated',            expiryDate: '' },
      { name: 'Garlic 250g',              sku: 'GARLIC-250G',     price: 30,    stock: 100, description: 'Fresh whole garlic bulbs',               brand: '',               unit: 'per pack',   weight: '250g',   categoryId: '',  costPrice: 18,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a cool dry place',   expiryDate: '' },
      { name: 'Banana (bunch)',           sku: 'BANANA-BUNCH',    price: 35,    stock: 60,  description: 'Ripe sweet bananas, approx. 7 per bunch', brand: '',              unit: 'per bunch',  weight: '~800g',  categoryId: '',  costPrice: 22,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep at room temperature',    expiryDate: '' },
      { name: 'Avocado (each)',           sku: 'AVOCADO-EACH',    price: 12,    stock: 80,  description: 'Creamy ripe avocado',                    brand: '',               unit: 'each',       weight: '~200g',  categoryId: '',  costPrice: 7,   lowStockThreshold: 10, isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Ripen at room temperature',   expiryDate: '' },
      { name: 'Orange Juice 1L',          sku: 'OJ-1L',           price: 65,    stock: 90,  description: '100% pure squeezed orange juice',        brand: 'Fruity',         unit: 'per carton', weight: '1L',     categoryId: '',  costPrice: 45,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Refrigerate after opening',   expiryDate: '2026-08-01' },
      { name: 'Mango Juice 500ml',        sku: 'MANGO-J-500ML',   price: 35,    stock: 110, description: 'Tropical mango nectar drink',            brand: 'Fruity',         unit: 'per bottle', weight: '500ml',  categoryId: '',  costPrice: 22,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Serve chilled',               expiryDate: '2027-02-15' },
      { name: 'Coffee Ground 500g',       sku: 'COFFEE-GRD-500G', price: 185,   stock: 50,  description: 'Medium roast Sidama coffee, ground',     brand: 'Yirgacheffe Co.',unit: 'per bag',    weight: '500g',   categoryId: '',  costPrice: 130, lowStockThreshold: 5,  isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in airtight container', expiryDate: '2027-12-31' },
      { name: 'Black Tea Bags 100pk',     sku: 'TEA-BLK-100PK',   price: 55,    stock: 80,  description: '100 individual black tea bags',          brand: 'Wush Wush',      unit: 'per box',    weight: '200g',   categoryId: '',  costPrice: 35,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a dry place',         expiryDate: '2028-06-01' },
      { name: 'Honey 500g',               sku: 'HONEY-500G',      price: 145,   stock: 45,  description: 'Pure raw Ethiopian forest honey',        brand: 'Bees of Ethiopia',unit: 'per jar',   weight: '500g',   categoryId: '',  costPrice: 100, lowStockThreshold: 5,  isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Store at room temperature',   expiryDate: '' },
      { name: 'Biscuits 200g',            sku: 'BISCUIT-200G',    price: 22,    stock: 200, description: 'Crunchy butter biscuits',                brand: 'Kana',           unit: 'per pack',   weight: '200g',   categoryId: '',  costPrice: 14,  lowStockThreshold: 25, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep in a cool dry place',    expiryDate: '2027-03-01' },
      { name: 'Chocolate Bar 100g',       sku: 'CHOC-100G',       price: 48,    stock: 100, description: 'Milk chocolate bar',                     brand: 'Kana',           unit: 'each',       weight: '100g',   categoryId: '',  costPrice: 30,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store below 25°C',             expiryDate: '2027-01-01' },
      { name: 'Chips 150g',               sku: 'CHIPS-150G',      price: 30,    stock: 150, description: 'Crispy salted potato chips',             brand: 'Crispy',         unit: 'per bag',    weight: '150g',   categoryId: '',  costPrice: 18,  lowStockThreshold: 20, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep away from moisture',      expiryDate: '2026-12-01' },
      { name: 'Washing Powder 1kg',       sku: 'WASH-PWD-1KG',    price: 58,    stock: 120, description: 'Heavy-duty laundry washing powder',      brand: 'Omo',            unit: 'per pack',   weight: '1kg',    categoryId: '',  costPrice: 40,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep dry',                     expiryDate: '' },
      { name: 'Dish Soap 500ml',          sku: 'DISH-SOAP-500ML', price: 32,    stock: 100, description: 'Grease-cutting dishwashing liquid',      brand: 'Sunlight',       unit: 'per bottle', weight: '500ml',  categoryId: '',  costPrice: 20,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep out of reach of children', expiryDate: '' },
      { name: 'Toilet Paper 12 rolls',    sku: 'TPAPER-12PK',     price: 95,    stock: 80,  description: '2-ply soft toilet paper, 12 rolls',      brand: 'Soft & Care',    unit: 'per pack',   weight: '1.2kg',  categoryId: '',  costPrice: 65,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: '',                             expiryDate: '' },
      { name: 'Hand Sanitiser 250ml',     sku: 'HSANITISER-250ML',price: 45,    stock: 60,  description: '70% alcohol hand sanitiser gel',         brand: 'CleanPlus',      unit: 'per bottle', weight: '250ml',  categoryId: '',  costPrice: 28,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Flammable — keep from flame', expiryDate: '2027-06-01' },
      { name: 'Shampoo 400ml',            sku: 'SHAMPOO-400ML',   price: 72,    stock: 70,  description: 'Moisturising hair shampoo',              brand: 'Dove',           unit: 'per bottle', weight: '400ml',  categoryId: '', costPrice: 48,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: '',                             expiryDate: '2028-01-01' },
      { name: 'Soap Bar 3pk',             sku: 'SOAP-BAR-3PK',    price: 28,    stock: 150, description: 'Moisturising bath soap bars, pack of 3', brand: 'Lux',            unit: 'per pack',   weight: '375g',   categoryId: '', costPrice: 17,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: '',                             expiryDate: '' },
      { name: 'Toothpaste 100ml',         sku: 'TPASTE-100ML',    price: 38,    stock: 90,  description: 'Fluoride toothpaste, fresh mint',        brand: 'Colgate',        unit: 'per tube',   weight: '100ml',  categoryId: '', costPrice: 24,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: '',                             expiryDate: '2028-06-01' },
      { name: 'Maize Flour 2kg',          sku: 'MAIZE-FL-2KG',    price: 48,    stock: 130, description: 'Fine white maize meal',                  brand: 'Alem Foods',     unit: 'per bag',    weight: '2kg',    categoryId: '',  costPrice: 32,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a dry place',         expiryDate: '' },
      { name: 'Spaghetti Sauce 350g',     sku: 'SPGSAUCE-350G',   price: 42,    stock: 110, description: 'Ready-to-use tomato spaghetti sauce',    brand: 'Red Gold',       unit: 'per jar',    weight: '350g',   categoryId: '',  costPrice: 27,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Refrigerate after opening',   expiryDate: '2027-09-01' },
      { name: 'Canned Tuna 185g',         sku: 'TUNA-185G',       price: 55,    stock: 80,  description: 'Tuna chunks in brine',                   brand: 'Seasons',        unit: 'per can',    weight: '185g',   categoryId: '',  costPrice: 35,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Refrigerate after opening',   expiryDate: '2028-12-01' },
      { name: 'Chickpeas 500g',           sku: 'CHICKPEA-500G',   price: 35,    stock: 140, description: 'Dried chickpeas (shimbra)',               brand: 'Alem Foods',     unit: 'per pack',   weight: '500g',   categoryId: '',  costPrice: 22,  lowStockThreshold: 15, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in airtight container', expiryDate: '' },
      { name: 'Black Pepper 50g',         sku: 'PEPPER-BLK-50G',  price: 25,    stock: 100, description: 'Ground black pepper',                    brand: 'Spice Route',    unit: 'per jar',    weight: '50g',    categoryId: '', costPrice: 14,  lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep away from moisture',      expiryDate: '2028-01-01' },
      { name: 'Berbere Spice 100g',       sku: 'BERBERE-100G',    price: 38,    stock: 75,  description: 'Authentic Ethiopian berbere spice blend', brand: 'Abyssinia Spice',unit: 'per pack',   weight: '100g',   categoryId: '', costPrice: 22,  lowStockThreshold: 10, isFeatured: 'true',  countryOfOrigin: 'Ethiopia', storageInstructions: 'Store in a cool dry place',   expiryDate: '2027-06-01' },
      { name: 'Cardamom Ground 30g',      sku: 'CARDAMOM-30G',    price: 30,    stock: 60,  description: 'Finely ground green cardamom',           brand: 'Spice Route',    unit: 'per pack',   weight: '30g',    categoryId: '', costPrice: 18,  lowStockThreshold: 8,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep away from moisture',      expiryDate: '2027-09-01' },
      { name: 'Noodles Instant 75g',      sku: 'NOODLES-75G',     price: 12,    stock: 300, description: 'Quick-cook instant noodles, chicken flavour', brand: 'Indo', unit: 'per pack',   weight: '75g',    categoryId: '',  costPrice: 6,   lowStockThreshold: 30, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep dry',                     expiryDate: '2027-01-01' },
      { name: 'Corn Flakes 375g',         sku: 'CORNFLAKE-375G',  price: 78,    stock: 60,  description: 'Toasted corn flakes breakfast cereal',   brand: 'Kellogg\'s',     unit: 'per box',    weight: '375g',   categoryId: '',  costPrice: 52,  lowStockThreshold: 8,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep dry after opening',       expiryDate: '2027-03-01' },
      { name: 'Minced Meat 500g',         sku: 'MINCE-500G',      price: 175,   stock: 30,  description: 'Fresh minced beef',                      brand: 'Zema Farm',      unit: 'per pack',   weight: '500g',   categoryId: '',  costPrice: 130, lowStockThreshold: 5,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep frozen',                  expiryDate: '2026-06-07' },
      { name: 'Olive Oil 500ml',          sku: 'OLIVEOIL-500ML',  price: 280,   stock: 35,  description: 'Extra virgin cold-pressed olive oil',    brand: 'Kefita',         unit: 'per bottle', weight: '500ml',  categoryId: '',  costPrice: 210, lowStockThreshold: 5,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Store away from light',        expiryDate: '2027-12-01' },
      { name: 'Peanut Butter 400g',       sku: 'PNUTBTR-400G',    price: 85,    stock: 55,  description: 'Smooth peanut butter, no added sugar',   brand: 'Naturals Co.',   unit: 'per jar',    weight: '400g',   categoryId: '',  costPrice: 58,  lowStockThreshold: 8,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Refrigerate after opening',   expiryDate: '2027-06-01' },
      { name: 'Mango (each)',             sku: 'MANGO-EACH',      price: 15,    stock: 70,  description: 'Fresh ripe mango',                       brand: '',               unit: 'each',       weight: '~300g',  categoryId: '',  costPrice: 8,   lowStockThreshold: 10, isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Ripen at room temperature',   expiryDate: '' },
      { name: 'Papaya (each)',            sku: 'PAPAYA-EACH',     price: 20,    stock: 50,  description: 'Fresh ripe papaya',                      brand: '',               unit: 'each',       weight: '~500g',  categoryId: '',  costPrice: 11,  lowStockThreshold: 8,  isFeatured: 'false', countryOfOrigin: 'Ethiopia', storageInstructions: 'Keep at room temperature',    expiryDate: '' },
    ]

    const rows = sampleProducts.map((p) => ({
      name: p.name, sku: p.sku, price: p.price, imageUrl: '', stock: p.stock,
      description: p.description, brand: p.brand, unit: p.unit, weight: p.weight,
      categoryId: p.categoryId, costPrice: p.costPrice, lowStockThreshold: p.lowStockThreshold,
      isFeatured: p.isFeatured, countryOfOrigin: p.countryOfOrigin,
      storageInstructions: p.storageInstructions, expiryDate: p.expiryDate,
      image2Url: '', image3Url: '', image4Url: '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers })

    // Column widths
    ws['!cols'] = headers.map((h) => ({
      wch: Math.max(h.length + 2, h === 'name' || h === 'description' || h === 'imageUrl' ? 32 : 16),
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'jam-store-products-template.xlsx')
  })
}

function onDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) processFile(file)
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) processFile(file)
  event.target.value = ''
}

async function processFile(file) {
  uploadError.value = null
  previewRows.value = []
  rowErrors.value = []
  importedCount.value = null

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['xlsx', 'xls'].includes(ext)) {
    uploadError.value = 'Only .xlsx and .xls files are accepted.'
    return
  }

  selectedFile.value = file

  // Client-side preview parse using xlsx
  try {
    const mod = await import('xlsx')
    const XLSX = mod.default ?? mod
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) { uploadError.value = 'The spreadsheet is empty.'; return }

    previewRows.value = rows
  } catch (e) {
    uploadError.value = 'Could not read the file. Make sure it is a valid .xlsx or .xls file.'
  }
}

async function doImport() {
  if (!selectedFile.value || importing.value) return
  importing.value = true
  rowErrors.value = []

  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value)
    const res = await $fetch('/api/products/import', {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${adminStore.token}` },
    })

    if (!res.ok) {
      rowErrors.value = res.errors ?? []
      previewRows.value = []
    } else {
      importedCreated.value = res.created ?? 0
      importedUpdated.value = res.updated ?? 0
      previewRows.value = []
      selectedFile.value = null
    }
  } catch (e) {
    uploadError.value = e?.data?.statusMessage ?? 'Import failed. Please try again.'
    previewRows.value = []
  } finally {
    importing.value = false
  }
}

function reset() {
  previewRows.value = []
  rowErrors.value = []
  selectedFile.value = null
  uploadError.value = null
}

useHead({ title: 'Import Products — Admin' })
</script>
