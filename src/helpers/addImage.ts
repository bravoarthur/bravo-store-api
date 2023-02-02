import { v4 as uuid } from "uuid";
import Jimp from "jimp";

const addImage = async (buffer: any) => {
    let newName = `${uuid()}.jpg`;
    let tmpImg = await Jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
};

export default addImage;
