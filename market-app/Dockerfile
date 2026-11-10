# استخدام صورة PHP الرسمية مع Apache
FROM php:8.4-apache

# تثبيت الحزم والأدوات المطلوبة لنظام Linux وتمديدات PHP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# تثبيت تمديدات PHP التي يحتاجها لارافل
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd

# تثبيت Composer لإدارة حزم PHP
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# تحديد مجلد العمل داخل الحاوية (Container)
WORKDIR /var/www/html

# نسخ ملفات المشروع إلى الحاوية
COPY . .

# تثبيت حزم الباك إند للإنتاج بدون حزم التطوير (Dev)
RUN composer install --no-dev --optimize-autoloader

# إعطاء صلاحيات الكتابة لمجلدات التخزين والكاش
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# تفعيل خاصية الـ Rewrite في Apache ليعمل نظام مسارات لارافل (Routes) بشكل سليم
RUN a2enmod rewrite

# توجيه مسار الـ Apache إلى مجلد الـ public الخاص بلارافل
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# فتح المنفذ 80 للاستماع للطلبات
EXPOSE 80

# تشغيل خادم Apache تلقائياً عند بدء تشغيل الحاوية
CMD php artisan config:cache && php artisan route:cache && php artisan migrate --force && apache2-foreground
