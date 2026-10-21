
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  putVote,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../api/backend';

function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();

  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);

  // ตรวจว่าหนังเรื่องนี้อยู่ใน Wishlist แล้วหรือยัง
  useEffect(() => {
    let ignore = false;

    async function loadWishlist() {
      if (!isLoggedIn || !token) return;

      try {
        const data = await getWishlist(token);

        const found = data.items?.some(
          item => String(item.id ?? item.movieId) === String(movieId)
        );

        if (!ignore) {
          setInWishlist(Boolean(found));
        }
      } catch (err) {
        if (!ignore) {
          console.error('โหลด wishlist ไม่สำเร็จ:', err);
        }
      }
    }

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, [isLoggedIn, token, movieId]);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link
          to="/login"
          className="text-emerald-600 hover:underline"
        >
          เข้าสู่ระบบ
        </Link>{' '}
        เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleVote(score) {
    try {
      await putVote(movieId, score, token);
      setMyScore(score);
      setMessage(null);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleWishlist() {
    try {
      if (inWishlist) {
        await removeFromWishlist(movieId, token);
        setInWishlist(false);
      } else {
        await addToWishlist(movieId, token);
        setInWishlist(true);
      }

      setMessage(null);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">
          ให้คะแนน
        </span>

        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => handleVote(n)}
            className={
              'h-8 w-8 rounded-lg border text-sm ' +
              (myScore === n
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
            }
          >
            {n}
          </button>
        ))}
      </div>

      <button
        onClick={handleWishlist}
        className={
          'rounded-lg border px-4 py-2 text-sm ' +
          (inWishlist
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
        }
      >
        {inWishlist
          ? '❤️ อยู่ในรายการที่อยากดูแล้ว'
          : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {message && (
        <p className="text-sm text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}

export default MovieActions;
