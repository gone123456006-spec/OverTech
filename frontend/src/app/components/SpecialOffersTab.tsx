import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Tag, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_SPECIAL_OFFERS,
  fetchSpecialOffers,
  getCachedSpecialOffers,
  newOfferId,
  saveSpecialOffers,
  type SpecialOffer,
  type SpecialOfferKind,
} from '../utils/specialOffers';

function SaveBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-primary-sm inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs">
      {children}
    </button>
  );
}

function OfferImageField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
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
        <img src={value} alt="" className="w-full max-h-28 object-contain rounded-xl bg-[#F5F5F7] ring-1 ring-black/[0.06]" />
      ) : null}
      <input
        type="text"
        value={value || ''}
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

function OfferEditor({
  offer,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  offer: SpecialOffer;
  onChange: (next: SpecialOffer) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            {offer.kind === 'card' ? 'Offer Card' : 'Offer Tag'}
          </span>
          <label className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73]">
            <input
              type="checkbox"
              checked={offer.active}
              onChange={(e) => onChange({ ...offer, active: e.target.checked })}
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
          <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Title</label>
          <input
            value={offer.title}
            onChange={(e) => onChange({ ...offer, title: e.target.value })}
            className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Price</label>
          <input
            value={offer.price}
            onChange={(e) => onChange({ ...offer, price: e.target.value })}
            className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
          />
        </div>
      </div>

      {offer.kind === 'card' ? (
        <OfferImageField value={offer.image} onChange={(image) => onChange({ ...offer, image })} />
      ) : (
        <div>
          <label className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide">Subtitle (optional)</label>
          <input
            value={offer.subtitle || ''}
            onChange={(e) => onChange({ ...offer, subtitle: e.target.value })}
            className="mt-1 w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30"
          />
        </div>
      )}
    </div>
  );
}

export function SpecialOffersTab() {
  const [offers, setOffers] = useState<SpecialOffer[]>(getCachedSpecialOffers());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialOffers()
      .then((data) => {
        setOffers(data.offers);
        setLastSaved(data.updatedAt || null);
      })
      .catch(() => {
        setOffers(getCachedSpecialOffers());
      });
  }, []);

  const cards = useMemo(
    () => offers.filter((o) => o.kind === 'card').sort((a, b) => a.sortOrder - b.sortOrder),
    [offers]
  );
  const tags = useMemo(
    () => offers.filter((o) => o.kind === 'tag').sort((a, b) => a.sortOrder - b.sortOrder),
    [offers]
  );

  const updateOffer = (id: string, next: SpecialOffer) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? next : o)));
  };

  const deleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const moveOffer = (id: string, direction: -1 | 1) => {
    setOffers((prev) => {
      const target = prev.find((o) => o.id === id);
      if (!target) return prev;
      const sameKind = prev
        .filter((o) => o.kind === target.kind)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const index = sameKind.findIndex((o) => o.id === id);
      const swapWith = sameKind[index + direction];
      if (!swapWith) return prev;

      return prev.map((o) => {
        if (o.id === target.id) return { ...o, sortOrder: swapWith.sortOrder };
        if (o.id === swapWith.id) return { ...o, sortOrder: target.sortOrder };
        return o;
      });
    });
  };

  const addOffer = (kind: SpecialOfferKind) => {
    const sameKind = offers.filter((o) => o.kind === kind);
    const next: SpecialOffer = {
      id: newOfferId(),
      kind,
      title: kind === 'card' ? 'New Offer' : 'New Service',
      price: '999/-',
      image: kind === 'card' ? '' : undefined,
      subtitle: kind === 'tag' ? '' : undefined,
      sortOrder: sameKind.length,
      active: true,
      whatsappPhone: '917991163225',
    };
    setOffers((prev) => [...prev, next]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = offers.map((offer, index) => ({
        ...offer,
        sortOrder: Number.isFinite(offer.sortOrder) ? offer.sortOrder : index,
      }));
      const data = await saveSpecialOffers(normalized);
      setOffers(data.offers);
      setLastSaved(data.updatedAt || new Date().toISOString());
      toast.success('Special offers saved. Website updates within 2 minutes.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save special offers');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setOffers(DEFAULT_SPECIAL_OFFERS);
    toast.message('Defaults loaded. Click Save to publish.');
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[#1D1D1F] font-medium">Manage Special Offers</p>
          <p className="text-xs text-[#6E6E73] mt-1">
            Changes appear on the homepage within about 2 minutes, or instantly after refresh.
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
            onClick={() => addOffer('card')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white ring-1 ring-black/[0.06] hover:bg-[#F5F5F7]"
          >
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
          <button
            type="button"
            onClick={() => addOffer('tag')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white ring-1 ring-black/[0.06] hover:bg-[#F5F5F7]"
          >
            <Tag className="w-3.5 h-3.5" /> Add Tag
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

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-widest">Offer Cards</p>
        {cards.map((offer) => (
          <OfferEditor
            key={offer.id}
            offer={offer}
            onChange={(next) => updateOffer(offer.id, next)}
            onDelete={() => deleteOffer(offer.id)}
            onMoveUp={() => moveOffer(offer.id, -1)}
            onMoveDown={() => moveOffer(offer.id, 1)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-widest">Offer Tags</p>
        {tags.map((offer) => (
          <OfferEditor
            key={offer.id}
            offer={offer}
            onChange={(next) => updateOffer(offer.id, next)}
            onDelete={() => deleteOffer(offer.id)}
            onMoveUp={() => moveOffer(offer.id, -1)}
            onMoveDown={() => moveOffer(offer.id, 1)}
          />
        ))}
      </div>
    </div>
  );
}
