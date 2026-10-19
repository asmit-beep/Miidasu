import Image from "../opengraph-image";

// Share the working image layout and finish rendering before returning a 200.
export async function GET() {
  const png = await Image().arrayBuffer();
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
