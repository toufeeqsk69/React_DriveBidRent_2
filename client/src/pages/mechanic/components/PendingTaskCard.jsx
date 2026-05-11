// Example: CurrentTaskCard.jsx (update both Current & Past)
import { Link } from 'react-router-dom';

export default function CurrentTaskCard({ vehicle }) {
  return (
    <Link to={`/mechanic/car-details/${vehicle._id}`}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-orange-300 overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img src={vehicle.vehicleImage} alt={vehicle.vehicleName} className="w-full h-56 object-cover" />
        <span className="absolute top-4 left-4 bg-orange-600 text-white font-bold px-5 py-2 rounded-full text-sm shadow-lg">
          CURRENT TASK
        </span>
      </div>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">{vehicle.vehicleName}</h3>
          <p className="text-gray-600">Year: {vehicle.year} • {vehicle.mileage.toLocaleString()} km</p>
          <p className="text-gray-600">Condition: {vehicle.condition}</p>
        </div>
        <div className="mt-6 text-center">
          <span className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold">View Details →</span>
        </div>
      </div>
    </Link>
  );
}