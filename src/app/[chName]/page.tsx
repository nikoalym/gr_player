

export default async function Page({ params }: { params: { chName: string } }) {
  const chName = (await params).chName;
  return (
    <div>
      <h1>Channel: {chName}</h1>
    </div>
  );
}
