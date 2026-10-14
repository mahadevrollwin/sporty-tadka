export type GallerySpan = 1 | 2 | 3;

export type GalleryImage = {
  id: string;
  type: "image";
  src: string;
  title: string;
  category: string;
  width: number;
  height: number;
  span: GallerySpan;
};

export type GalleryVideo = {
  id: string;
  type: "video";
  src: string;
  poster: string;
  title: string;
  category: string;
  width: number;
  height: number;
  span: GallerySpan;
};

export type GalleryItem = GalleryImage | GalleryVideo;

export const galleryImages: GalleryImage[] = [
  {
    id: "kohli-song",
    type: "image",
    src: "/gallery/images/kohli-song.jpg",
    title: "The Kohli Song",
    category: "Cricket · Film",
    width: 576,
    height: 1024,
    span: 2,
  },
  {
    id: "cr7-last-dance",
    type: "image",
    src: "/gallery/images/cr7-last-dance.jpg",
    title: "CR7 Last Dance",
    category: "Football · Film",
    width: 576,
    height: 1024,
    span: 1,
  },
  {
    id: "born-from-fire",
    type: "image",
    src: "/gallery/images/born-from-fire.jpg",
    title: "Born From Fire",
    category: "Cricket · Campaign",
    width: 576,
    height: 1024,
    span: 1,
  },
  {
    id: "happy-birthday-cr7",
    type: "image",
    src: "/gallery/images/happy-birthday-cr7.jpg",
    title: "Happy Birthday CR7",
    category: "Football · Social",
    width: 576,
    height: 1024,
    span: 1,
  },
  {
    id: "forever-thalapathy",
    type: "image",
    src: "/gallery/images/forever-thalapathy.jpg",
    title: "Forever Thalapathy",
    category: "Cricket · Tribute",
    width: 576,
    height: 1024,
    span: 2,
  },
  {
    id: "thank-you-cena",
    type: "image",
    src: "/gallery/images/thank-you-cena.jpg",
    title: "Thank You Cena",
    category: "Wrestling · Tribute",
    width: 576,
    height: 1024,
    span: 1,
  },
  {
    id: "you-wont-see-me",
    type: "image",
    src: "/gallery/images/you-wont-see-me.jpg",
    title: "You Won't See Me",
    category: "Wrestling · Film",
    width: 576,
    height: 1024,
    span: 1,
  },
];

export const galleryVideos: GalleryVideo[] = [
  {
    id: "cr7-last-dance-wide",
    type: "video",
    src: "/gallery/videos/cr7-last-dance.mp4",
    poster: "/gallery/posters/cr7-last-dance.png",
    title: "CR7 Last Dance",
    category: "Football · Widescreen",
    width: 1280,
    height: 720,
    span: 3,
  },
  {
    id: "john-cena-retirement",
    type: "video",
    src: "/gallery/videos/john-cena-retirement.mp4",
    poster: "/gallery/posters/john-cena-retirement.png",
    title: "John Cena Retirement",
    category: "Wrestling · Film",
    width: 720,
    height: 1280,
    span: 1,
  },
  {
    id: "born-from-fire-vertical",
    type: "video",
    src: "/gallery/videos/born-from-fire-vertical.mp4",
    poster: "/gallery/posters/born-from-fire-vertical.png",
    title: "Born From Fire",
    category: "Cricket · Vertical",
    width: 720,
    height: 1280,
    span: 1,
  },
  {
    id: "forever-thalapathy-wide",
    type: "video",
    src: "/gallery/videos/forever-thalapathy.mp4",
    poster: "/gallery/posters/forever-thalapathy.png",
    title: "Forever Thalapathy",
    category: "Cricket · Widescreen",
    width: 1280,
    height: 720,
    span: 2,
  },
  {
    id: "cr7-last-dance-vertical",
    type: "video",
    src: "/gallery/videos/cr7-last-dance-vertical.mp4",
    poster: "/gallery/posters/cr7-last-dance-vertical.png",
    title: "CR7 Last Dance",
    category: "Football · Vertical",
    width: 720,
    height: 1280,
    span: 1,
  },
  {
    id: "born-from-fire-wide",
    type: "video",
    src: "/gallery/videos/born-from-fire.mp4",
    poster: "/gallery/posters/born-from-fire.png",
    title: "Born From Fire",
    category: "Cricket · Widescreen",
    width: 1280,
    height: 720,
    span: 2,
  },
  {
    id: "forever-thalapathy-vertical",
    type: "video",
    src: "/gallery/videos/forever-thalapathy-vertical.mp4",
    poster: "/gallery/posters/forever-thalapathy-vertical.png",
    title: "Forever Thalapathy",
    category: "Cricket · Vertical",
    width: 720,
    height: 1280,
    span: 1,
  },
];
