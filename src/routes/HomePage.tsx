import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section className="grid min-h-[68vh] place-items-center">
      <div className="max-w-3xl text-center">
        <p className="text-xl font-bold text-warm-700">티키타카 기억카드</p>
        <h1 className="mt-4 text-5xl font-bold leading-tight text-stone-950">
          추억 이야기를 묻고,
          <br />
          한 장의 카드로 남겨요.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-2xl leading-relaxed text-stone-700">
          청년의 질문과 답장으로 어르신의 기억을 따뜻하게 기록하는 웹앱입니다.
        </p>
        <Link
          to="/topics"
          className="mt-10 inline-block rounded-lg bg-leaf-700 px-8 py-5 text-2xl font-bold text-white shadow-sm hover:bg-leaf-500"
        >
          기억카드 만들기
        </Link>
      </div>
    </section>
  );
}
