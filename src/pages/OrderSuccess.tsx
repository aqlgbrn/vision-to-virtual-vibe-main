import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Pesanan Berhasil!</h1>
            <p className="text-muted-foreground">
              Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.
            </p>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Detail Pesanan</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nomor Pesanan</span>
                <span className="font-medium">#ORD-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-yellow-600">Menunggu Pembayaran</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pembayaran</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Silakan lakukan pembayaran ke rekening berikut:
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Bank</span>
                  <span>BCA</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">No. Rekening</span>
                  <span>1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Atas Nama</span>
                  <span>Vision Store</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mohon konfirmasi pembayaran setelah melakukan transfer.
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Estimasi Pengiriman
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proses</span>
                <span>1-2 hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman</span>
                <span>3-5 hari</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimasi Tiba</span>
                <span>4-7 hari</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-2" />
              Lanjut Belanja
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
