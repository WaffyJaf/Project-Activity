import Navbar from '../component/navbar';


function Home() {
  return (
    <div className="bg-gray-100 min-h-screen overflow-hidden bg-[url('/up.jpg')] bg-cover bg-no-repeat bg-fixed w-full ">
      <Navbar />
    </div>
  );
}

export default Home;