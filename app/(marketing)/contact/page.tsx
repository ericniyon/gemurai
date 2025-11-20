"use client"

import { Mail, Phone, MapPin, Send } from "lucide-react"
import Button from "@/components/yden/ui/button"
import ScrollReveal from "@/components/yden/ui/scroll-reveal"

export default function ContactPage() {
  const inputClasses =
    "w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400"
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2"

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="text-white py-16" style={{ backgroundColor: '#0099f2' }}>
        <div className="max-w-7xl mx-auto px-4 text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold">Get in touch</h1>
          <p className="mt-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20">
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            {/* Info Side */}
            <div className="bg-slate-50 p-10 md:w-1/3 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 mt-1 mr-4" style={{ color: '#0099f2' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</p>
                    <p className="text-slate-700">info@yden.rw</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 mt-1 mr-4" style={{ color: '#0099f2' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone</p>
                    <p className="text-slate-700">+250 XXX XXX XXX</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mt-1 mr-4" style={{ color: '#0099f2' }} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Office</p>
                    <p className="text-slate-700">Kigali, Rwanda</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="font-bold text-slate-900 mb-4">Social Media</h4>
                <div className="flex space-x-4">
                  {/* Social Icons placeholder */}
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer text-slate-600 hover:[background-color:rgba(0,153,242,0.1)]">
                    X
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer text-slate-600 hover:[background-color:rgba(0,153,242,0.1)]">
                    In
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer text-slate-600 hover:[background-color:rgba(0,153,242,0.1)]">
                    Fb
                  </div>
            </div>
            </div>
            </div>

            {/* Form Side */}
            <div className="p-10 md:w-2/3">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Name</label>
                    <input type="text" className={inputClasses} placeholder="Your full name" style={{ '--tw-ring-color': '#0099f2' } as React.CSSProperties & { '--tw-ring-color'?: string }} />
                  </div>
                  <div>
                    <label className={labelClasses}>Phone (Optional)</label>
                    <input type="tel" className={inputClasses} placeholder="+250..." />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Email</label>
                    <input type="email" className={inputClasses} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className={labelClasses}>I am a...</label>
                    <select className={inputClasses}>
                      <option>Youth</option>
                      <option>Partner</option>
                      <option>Media</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Subject</label>
                  <input type="text" className={inputClasses} placeholder="What is this regarding?" />
                </div>
                <div>
                  <label className={labelClasses}>Message</label>
                  <textarea rows={4} className={inputClasses} placeholder="How can we help you?"></textarea>
                </div>
                <div>
                  <Button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 text-lg px-8">
                    Send Message <Send size={18} />
                  </Button>
            </div>
              </form>
            </div>
          </div>
        </ScrollReveal>
        </div>
    </div>
  )
}
