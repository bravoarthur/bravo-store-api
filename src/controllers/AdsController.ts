import { Request, Response } from "express";
import Categories from "../models/categories";
import dotenv from "dotenv";
import User, { UserWithId } from "../models/user";
import Ads from "../models/ads";
import addImage from "../helpers/addImage";
import { UploadedFile } from "express-fileupload";
import State from "../models/state";
import { isValidObjectId } from "mongoose";
import { unlink } from "fs/promises";

dotenv.config();

type FilterType = {
    status: boolean;
    category?: string;
    state?: string;
    title?: { [fieldname: string]: string };
};
type EditAdType = {
    title?: string;
    status?: boolean;
    price?: number;
    priceNegotiable?: boolean;
    description?: string;
    category?: string;
    images?: { url: string; default: boolean }[];
};

const AdsController = {
    getCategories: async (req: Request, res: Response) => {
        const cats = await Categories.find();

        let categories = cats.map((item, index) => {
            const updatedCat = {
                _id: item._id,
                name: item.name,
                slug: item.slug,
                img: `${process.env.BASE}/assets/images/${cats[index].slug}.png`
            };
            return updatedCat;
        });
        /*
        for(let i in cats) {
            console.log(cats[i])
            categories.push({
                ...cats[i], img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            })
        }*/
        res.json({ categories: categories });
    },

    addAction: async (req: Request, res: Response) => {
        let { title, price, priceNeg, desc, cat } = req.body;

        const user = await User.findOne({
            user: req.user as UserWithId
        }).exec();

        if (!user) {
            res.json({
                err: { messaga: "The user needs to be logged to add ads" }
            });
            return;
        }

        if (!title || !cat) {
            res.json({ error: { message: "Title or Category is missing" } });
            return;
        }
        console.log('AQUII')
        if (price) {
            console.log(price)
            price = price.slice(3)
            price = price.replace(".", "").replace(",", ".");
            price = parseFloat(price);
        } else {
            price = 0;
        }
        console.log(price)
        const categoryId = await Categories.findOne({
            $regex: cat,
            $options: "i"
        }).exec();

        if (!categoryId) {
            res.json({
                error: { message: "Please provide a correct category" }
            });
            return;
        }

        const newAd = new Ads();
        (newAd.status = true),
            (newAd.idUser = user._id),
            (newAd.state = user.state),
            (newAd.dateCreated = new Date()),
            (newAd.title = title),
            (newAd.category = categoryId._id),
            (newAd.price = price),
            (newAd.priceNegotiable = priceNeg === "true" ? true : false),
            (newAd.description = desc),
            (newAd.views = 0);

        if (req.files && req.files.img) {
            let imgFiles = req.files.img as UploadedFile[];

            if (imgFiles.length === undefined) {
                let imgFile = req.files.img as UploadedFile;

                if (
                    ["image/jpeg", "image/jpg", "image/png"].includes(
                        imgFile.mimetype
                    )
                ) {
                    let url = await addImage(imgFile.data);
                    newAd.images.push({
                        url: url,
                        default: false
                    });
                } else {
                    res.status(400);
                    res.json({ error: { message: "invalid image format" } });
                    return;
                }
            } else {
                for (let i = 0; i < imgFiles.length; i++) {
                    if (
                        ["image/jpeg", "image/jpg", "image/png"].includes(
                            imgFiles[i].mimetype
                        )
                    ) {
                        let url = await addImage(imgFiles[i].data);
                        newAd.images.push({
                            url: url,
                            default: false
                        });
                    } else {
                        res.status(400);
                        res.json({
                            error: { message: "invalid image format" }
                        });
                        return;
                    }
                }
            }
        }

        if (newAd.images.length > 0) {
            newAd.images[0].default = true;
        }

        const info = await newAd.save();
        res.json({ id: info._id });
    },

    getList: async (req: Request, res: Response) => {
        let total = 0;
        let { sort = "asc", offset = 0, limit = 8, q, cat, state } = req.query;
        let filters: FilterType = { status: true };

        if (q) {
            q = q as string;
            filters.title = { $regex: q, $options: "i" };
        }

        if (cat) {
            const catFilter = await Categories.findOne({ slug: cat }).exec();
            if (catFilter) {
                filters.category = catFilter._id.toString();
            }
        }

        if (state) {
            state = state as string;
            const stateFilter = await State.findOne({
                name: state.toUpperCase()
            }).exec();
            if (stateFilter) {
                filters.state = stateFilter._id.toString();
            }
        }

        const adsTotal = await Ads.find(filters).exec();
        total = adsTotal.length;        
        const adsData = await Ads.find(filters)
            .sort({ dateCreated: sort === "desc" ? -1 : 1 })
            .skip(parseInt(offset as string))
            .limit(parseInt(limit as string))
            .exec();

        let ads = [];
        for (let i in adsData) {
            let defaultImg = adsData[i].images.find((e) => e.default);
            let image;

            if (defaultImg) {
                image = `${process.env.Base}/media/${defaultImg.url}`;
            } else {
                image = `${process.env.Base}/media/default.jpg`;
            }

            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image: image
            });
        }
        res.json({ ads: ads, total: total });
    },

    getItem: async (req: Request, res: Response) => {
        let { id, other = null } = req.query;

        if (!isValidObjectId(id)) {
            res.status(400);
            res.json({
                error: { message: "No Product selected - Check product ID" }
            });
            return;
        }

        const ad = await Ads.findById(id);
        if (!ad) {
            res.status(400);
            res.json({ error: { message: "No Product selected" } });
            return;
        }

        ad.views++;
        await ad.save();

        let images = [];
        for (let i in ad.images) {
            images.push(`${process.env.Base}/media/${ad.images[i].url}`);
        }

        if (images.length === 0) {
            images.push(`${process.env.Base}/media/default.jpg`)
        }

        let category = await Categories.findById(ad.category).exec();
        let userInfo = await User.findById(ad.idUser).exec();
        let stateInfo = await State.findById(ad.state);

        let others = [];
        if (other) {
            const otherData = await Ads.find({
                status: true,
                idUser: ad.idUser
            }).exec();

            for (let i in otherData) {
                if (otherData[i]._id.toString() !== ad._id.toString()) {
                    let image = `${process.env.Base}/media/default.jpg`;
                    let defaultImg = otherData[i].images.find((e) => e.default);
                    if (defaultImg) {
                        image = `${process.env.Base}/media/${defaultImg.url}`;
                    }

                    others.push({
                        id: otherData[i].id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        image: image
                    });
                }
            }
        }

        res.json({
            id: ad.id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images: images,
            category: category,
            userInfo: { name: userInfo?.name, email: userInfo?.email },
            state: stateInfo?.name,
            others: others
        });
    },
    editAction: async (req: Request, res: Response) => {
        let { id } = req.params;
        let { title, status, price, priceNeg, desc, cat, images, token } =
            req.body;

        let updates: EditAdType = {};

        if (!isValidObjectId(id)) {
            res.status(400);
            res.json({ error: { message: "Product doesnt exist, try again" } });
            return;
        }

        const adTobeEdited = await Ads.findById(id).exec();

        if (!adTobeEdited) {
            res.status(400);
            res.json({ error: { message: "Product doesnt exist, try again" } });
            return;
        }

        //const user = await User.findOne({token: token}).exec()
        const user = req.user as UserWithId;

        if (user!._id.toString() !== adTobeEdited.idUser) {
            res.status(400);
            res.json({ error: { message: "You cannot edit this Ad" } });
            return;
        }

        if (title) {
            updates.title = title;
        }

        if (price) {
            price = price.replace(".", "").replace(",", ".");
            price = parseFloat(price);
            updates.price = price;
        }

        if (priceNeg) {
            priceNeg = priceNeg === "true" ? true : false;
            updates.priceNegotiable = priceNeg;
        }

        if (status) {
            status = status === "true" ? true : false;
            updates.status = status;
        }

        if (desc) {
            updates.description = desc;
        }

        if (cat) {
            const category = await Categories.findOne({ slug: cat }).exec();

            if (!category) {
                res.status(400);
                res.json({ error: { message: "Invalid Category" } });
                return;
            }

            updates.category = category._id.toString();
        }

        if (images) {
            // if deleting images - the frontend should send the array without the images deleted - If the images is empty array all images will be deleted

            let newImages = [];

            if (images.length === 0) {
                for (let i in adTobeEdited.images) {
                    await unlink(
                        `./public/media/${adTobeEdited.images[i].url}`
                    );
                }
            } else {
                for (let i in adTobeEdited.images) {
                    if (adTobeEdited.images[i].url === images[i].url) {
                        newImages.push(adTobeEdited.images[i]);
                    } else {
                        await unlink(
                            `./public/media/${adTobeEdited.images[i].url}`
                        );
                    }
                }
            }
            updates.images = newImages;
        }

        if (req.files && req.files.img) {
            let imgFiles = req.files.img as UploadedFile[];

            if (imgFiles.length === undefined) {
                let imgFile = req.files.img as UploadedFile;

                if (
                    ["image/jpeg", "image/jpg", "image/png"].includes(
                        imgFile.mimetype
                    )
                ) {
                    if (!updates.images) {
                        updates.images = adTobeEdited.images;
                    }
                    let url = await addImage(imgFile.data);
                    updates.images.push({
                        url: url,
                        default: false
                    });
                } else {
                    res.status(400);
                    res.json({ error: { message: "invalid image format" } });
                    return;
                }
            } else {
                if (!updates.images) {
                    updates.images = [];
                }

                for (let i = 0; i < imgFiles.length; i++) {
                    if (
                        ["image/jpeg", "image/jpg", "image/png"].includes(
                            imgFiles[i].mimetype
                        )
                    ) {
                        let url = await addImage(imgFiles[i].data);
                        updates.images.push({
                            url: url,
                            default: false
                        });
                    } else {
                        res.status(400);
                        res.json({
                            error: { message: "invalid image format" }
                        });
                        return;
                    }
                }
            }
        }

        if (updates.images) {
            if (updates.images.length > 0) updates.images[0].default = true;
        }

        await Ads.findByIdAndUpdate(id, { $set: updates });

        res.json({ error: "" });
    }
};

export default AdsController;
