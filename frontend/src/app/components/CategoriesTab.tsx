import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, LayoutGrid, Plus, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_CATEGORY_CARDS,
  fetchCategoryCards,
  getCachedCategoryCards,
  newCategoryId,
  saveCategoryCards,
  type CategoryCard,
} from '../utils/categoryCards';

function SaveBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-primary-sm inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs">
      {children}
    </button>
  );
}

function CategoryImageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <img src={value} alt="" className="w-full max-h-32 object-cover rounded-xl bg-[#F5F5F7] ring-1 ring-black/[0.06]" />
      ) : null}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL"
        className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30 text-[#1D1D1F]"
      />
      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#D2D2D7] hover:border-[#134e4a] text-xs text-[#6E6E73] hover:text-[#134e4a] cursor-pointer transition-colors">
        <Upload className="w-3.5 h-3.5" /> Upload image
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

function CategoryEditor({
  category,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  category: CategoryCard;
  onChange: (next: CategoryCard) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#6E6E73]" />
          <label className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73]">
            <input
              type="checkbox"
              checked={category.active}
              onChange={(e) => onChange({ ...category, active: e.target.checked })}
            />
            Active
          </label>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#6E6E73]">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onMoveDown} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#6E6E73]">
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Name</label>
          <input
            value={category.name}
            onChange={(e) => onChange({ ...category, name: e.target.value })}
            className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Slug (URL)</label>
          <input
            value={category.slug}
            onChange={(e) => onChange({ ...category, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="tech, food, jewellery"
            className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
          />
          <p className="text-[10px] text-[#9E9EA7] mt-1">Links to /category/{category.slug || 'slug'}</p>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Description</label>
        <input
          value={category.description}
          onChange={(e) => onChange({ ...category, description: e.target.value })}
          className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
        />
      </div>

      <CategoryImageField value={category.image} onChange={(image) => onChange({ ...category, image })} />
    </div>
  );
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryCard[]>(getCachedCategoryCards());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryCards()
      .then((data) => {
        setCategories(data.categories);
        setLastSaved(data.updatedAt || null);
      })
      .catch(() => setCategories(getCachedCategoryCards()));
  }, []);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const updateCategory = (id: string, next: CategoryCard) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? next : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const moveCategory = (id: string, direction: -1 | 1) => {
    setCategories((prev) => {
      const list = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = list.findIndex((c) => c.id === id);
      const swapWith = list[index + direction];
      if (!swapWith) return prev;

      return prev.map((c) => {
        if (c.id === list[index].id) return { ...c, sortOrder: swapWith.sortOrder };
        if (c.id === swapWith.id) return { ...c, sortOrder: list[index].sortOrder };
        return c;
      });
    });
  };

  const addCategory = () => {
    const next: CategoryCard = {
      id: newCategoryId(),
      slug: `category-${categories.length + 1}`,
      name: 'New Category',
      description: 'Short description',
      image: '',
      sortOrder: categories.length,
      active: true,
    };
    setCategories((prev) => [...prev, next]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = categories.map((category, index) => ({
        ...category,
        sortOrder: Number.isFinite(category.sortOrder) ? category.sortOrder : index,
      }));
      const data = await saveCategoryCards(normalized);
      setCategories(data.categories);
      setLastSaved(data.updatedAt || new Date().toISOString());
      toast.success('Category cards saved. Website updates within 1 minute.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save categories');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setCategories(DEFAULT_CATEGORY_CARDS);
    toast.message('Defaults loaded. Click Save to publish.');
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[#1D1D1F] font-medium">Shop by Category Cards</p>
          <p className="text-xs text-[#6E6E73] mt-1">
            Edit images, names, and add new category cards on the homepage. Slug must match product category (tech, jewellery, food) to show products.
          </p>
          {lastSaved && (
            <p className="text-[11px] text-[#9E9EA7] mt-1">
              Last saved: {new Date(lastSaved).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white ring-1 ring-black/[0.06] hover:bg-[#F5F5F7]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white ring-1 ring-black/[0.06] hover:bg-[#F5F5F7]"
          >
            Reset defaults
          </button>
          <SaveBtn onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save & Publish'}
          </SaveBtn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((category) => (
          <CategoryEditor
            key={category.id}
            category={category}
            onChange={(next) => updateCategory(category.id, next)}
            onDelete={() => deleteCategory(category.id)}
            onMoveUp={() => moveCategory(category.id, -1)}
            onMoveDown={() => moveCategory(category.id, 1)}
          />
        ))}
        {sorted.length === 0 && (
          <p className="col-span-full text-sm text-[#6E6E73] text-center py-8">No categories yet. Click Add Category.</p>
        )}
      </div>
    </div>
  );
}
