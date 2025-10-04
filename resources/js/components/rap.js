import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div id="homepage" className="p-6 max-w-2xl mx-auto text-center">
      {/* Introduction Section */}
      <h1 className="text-3xl font-bold mb-4">Welcome to Nadela Opaw</h1>
      <p className="text-lg mb-6">
        Before anything else, let’s begin with a short introduction. 
        You may be wondering — <strong>why Nadela, and why Opaw?</strong>
      </p>

      {/* Why Nadela is Opaw */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Why Nadela is Opaw</h2>
        <p className="text-base leading-relaxed">
          Nadela is called <em>Opaw</em> because it represents more than just a 
          name — it’s a character, a personality, and a story rolled into one. 
          The word “Opaw” is a playful, unique identity that captures Nadela’s 
          way of standing out and being remembered. It reflects creativity, 
          authenticity, and a little bit of fun. 
        </p>
      </section>

      {/* The Meaning Behind Opaw */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">The Meaning Behind Opaw</h2>
        <p className="text-base leading-relaxed">
          Opaw is not just a label — it’s an expression. For Nadela, it signifies 
          being different without fear, embracing uniqueness, and creating a 
          mark that others can connect with. It’s both personal and symbolic: 
          <br />
          • <strong>Personal</strong> because it defines Nadela’s style and character. <br />
          • <strong>Symbolic</strong> because it encourages others to embrace 
          their own uniqueness.
        </p>
      </section>

      {/* Navigation */}
      <div className="mt-8">
        <Link 
          to="/about" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Learn More About Nadela
        </Link>
      </div>
    </div>
  )
}
