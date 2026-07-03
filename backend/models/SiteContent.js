import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);
export default SiteContent;
