import { Instagram, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="bg-plum text-cream w-full">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">MUSED</h3>

                        <div className="flex space-x-4">
                            <a
                                href="https://www.linkedin.com/company/mused-852/"
                                className="text-cream/70 hover:text-gold transition-colors"
                                aria-label="LinkedIn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="https://www.instagram.com/mused852/"
                                className="text-cream/70 hover:text-gold transition-colors"
                                aria-label="Instagram"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-medium mb-4">Lend & Rent</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/collections"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/upload"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Upload
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-medium mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/reachout"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Enquiries
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-cream/70 hover:text-gold transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-burgundy-light/20 mt-12 pt-8 text-center text-cream/50 text-sm">
                    <p>© 2026 Mused. All rights reserved.</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        <Link to="/privacy" className="hover:text-gold transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-gold transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className="hover:text-gold transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}