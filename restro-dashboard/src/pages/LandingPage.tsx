import { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Star,
  Utensils,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    "All",
    "Asian",
    "Italian",
    "Mexican",
    "Desserts",
    "Drinks",
  ];

  const featuredRestaurants = [
    {
      id: 1,
      name: "Noodle House",
      image: "/api/placeholder/300/200",
      category: "Asian",
      rating: 4.8,
      waitTime: "15-20 min",
    },
    {
      id: 2,
      name: "Pizza Plaza",
      image: "/api/placeholder/300/200",
      category: "Italian",
      rating: 4.6,
      waitTime: "20-25 min",
    },
    {
      id: 3,
      name: "Taco Corner",
      image: "/api/placeholder/300/200",
      category: "Mexican",
      rating: 4.7,
      waitTime: "10-15 min",
    },
    {
      id: 4,
      name: "Sweet Treats",
      image: "/api/placeholder/300/200",
      category: "Desserts",
      rating: 4.9,
      waitTime: "5-10 min",
    },
  ];

  const trendingItems = [
    {
      id: 1,
      name: "Spicy Ramen",
      restaurant: "Noodle House",
      image: "/api/placeholder/100/100",
    },
    {
      id: 2,
      name: "Margherita Pizza",
      restaurant: "Pizza Plaza",
      image: "/api/placeholder/100/100",
    },
    {
      id: 3,
      name: "Street Tacos",
      restaurant: "Taco Corner",
      image: "/api/placeholder/100/100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading delicious options...
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="relative rounded-3xl overflow-hidden bg-blue-600 text-white mb-12">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10 px-8 py-16 md:py-24 md:px-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Satisfy Your Cravings
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-lg">
                Discover a world of flavors at your fingertips. Order from
                multiple restaurants in one go.
              </p>

              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search for restaurants or dishes..."
                  className="w-full py-3 px-5 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="absolute right-4 top-3">
                  <Search className="text-gray-500" size={20} />
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Featured Restaurants */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Restaurants</h2>
              <button className="flex items-center text-blue-600 font-medium">
                View All <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                        <Star size={14} className="mr-1 fill-current" />{" "}
                        {restaurant.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 mb-3">
                      <Utensils size={16} className="mr-2" />
                      <span>{restaurant.category}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock size={16} className="mr-2" />
                      <span>{restaurant.waitTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Now Section */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <TrendingUp size={24} className="text-red-500 mr-2" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-gray-500">{item.restaurant}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-xl mb-6 max-w-lg mx-auto">
              Download our mobile app for exclusive deals and faster ordering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition">
                App Store
              </button>
              <button className="bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition">
                Google Play
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
