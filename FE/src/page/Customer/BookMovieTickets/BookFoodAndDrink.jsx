import React, { useEffect, useState } from "react";
import { getAllFoodAndDrinks } from "../../../service/foodanddrink";
import { InputNumber, Button } from "antd";
import logo from "../../../assets/img/logo.png";

const BookFoodAndDrink = ({ selectedFoods = [], setSelectedFoods = () => {} }) => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      const res = await getAllFoodAndDrinks();
      setFoods(Array.isArray(res) ? res.filter(f => f.active) : []);
    };
    fetchFoods();
  }, []);

  const handleChange = (food, qty) => {
    if (qty < 0) qty = 0;
    if (qty > 99) qty = 99;
    setSelectedFoods((prev = []) => {
      const exists = prev.find((f) => f.id === food.id);
      if (exists) {
        return qty > 0
          ? prev.map((f) => (f.id === food.id ? { ...f, quantity: qty } : f))
          : prev.filter((f) => f.id !== food.id);
      }
      return qty > 0 ? [...prev, { ...food, quantity: qty }] : prev;
    });
  };

  const getQuantity = (foodId) => selectedFoods.find(f => f.id === foodId)?.quantity || 0;

  return (
    <div className="mt-6 bg-white/80 rounded-lg p-4 shadow">
      <div className="font-bold text-lg mb-2 text-orange-600">Chọn Đồ ăn & Đồ uống</div>
      {foods.length === 0 && <div className="text-gray-500">Không có món nào khả dụng.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foods.map((food) => {
          const quantity = getQuantity(food.id);
          return (
            <div key={food.id} className="flex items-center gap-3 border-b pb-2">
              <img
                src={food.image || logo}
                alt={food.name}
                className="w-14 h-14 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = logo;
                }}
              />
              <div className="flex-1">
                <div className="font-semibold">{food.name}</div>
                <div className="text-sm text-gray-500">{food.description}</div>
                <div className="text-orange-600 font-bold">{Number(food.price).toLocaleString()}đ</div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="small"
                  onClick={() => handleChange(food, quantity - 1)}
                  disabled={quantity <= 0}
                >-</Button>
                <InputNumber
                  min={0}
                  max={99}
                  value={quantity}
                  onChange={qty => handleChange(food, qty)}
                  className="w-16"
                  step={1}
                />
                <Button
                  size="small"
                  onClick={() => handleChange(food, quantity + 1)}
                  disabled={quantity >= 99}
                >+</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookFoodAndDrink;