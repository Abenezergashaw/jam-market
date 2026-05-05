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

function downloadTemplate() {
  import('xlsx').then((mod) => {
    const XLSX = mod.default ?? mod

    const headers = COLUMNS.map((c) => c.name)
    const example1 = {
      name: 'Coconut Oil 500ml',
      sku: 'COCONUT-500ML',
      price: 89.99,
      imageUrl: '',
      stock: 150,
      description: 'Cold-pressed organic coconut oil',
      brand: 'Naturals Co.',
      unit: 'per bottle',
      weight: '500ml',
      categoryId: '',
      costPrice: '',
      lowStockThreshold: 20,
      isFeatured: 'false',
      countryOfOrigin: 'Ethiopia',
      storageInstructions: 'Keep in a cool dry place',
      expiryDate: '2027-06-30',
      image2Url: '',
      image3Url: '',
      image4Url: '',
    }
    const example2 = {
      name: 'Whole Wheat Bread',
      sku: 'BREAD-WW-400G',
      price: 35,
      imageUrl: '',
      stock: 80,
      description: 'Freshly baked whole wheat loaf',
      brand: 'Jam Bakery',
      unit: 'per loaf',
      weight: '400g',
      categoryId: '',
      costPrice: '',
      lowStockThreshold: 15,
      isFeatured: 'true',
      countryOfOrigin: 'Ethiopia',
      storageInstructions: 'Consume within 3 days',
      expiryDate: '',
      image2Url: '',
      image3Url: '',
      image4Url: '',
    }

    const ws = XLSX.utils.json_to_sheet([example1, example2], { header: headers })

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
    if (rows.length > 500) { uploadError.value = 'Too many rows. Maximum is 500 products per import.'; return }

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
