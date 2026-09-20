using System;
using LocadoraVeiculos.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Data
{
    public class LocadoraContext : DbContext
    {
        public LocadoraContext(DbContextOptions<LocadoraContext> options) : base(options) { }

        public DbSet<Fabricante> Fabricantes => Set<Fabricante>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<Veiculo> Veiculos => Set<Veiculo>();
        public DbSet<Cliente> Clientes => Set<Cliente>();
        public DbSet<Aluguel> Alugueis => Set<Aluguel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Fabricante>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.Nome).IsRequired().HasMaxLength(100);
                entity.Property(f => f.PaisOrigem).HasMaxLength(100);
                entity.HasIndex(f => f.Nome).IsUnique();
            });

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Nome).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Descricao).HasMaxLength(500);
                entity.Property(c => c.ValorDiaria).IsRequired().HasColumnType("decimal(10,2)");
                entity.HasIndex(c => c.Nome).IsUnique();
            });

            modelBuilder.Entity<Veiculo>(entity =>
            {
                entity.HasKey(v => v.Id);
                entity.Property(v => v.Modelo).IsRequired().HasMaxLength(100);
                entity.Property(v => v.AnoFabricacao).IsRequired();
                entity.Property(v => v.Quilometragem).HasColumnType("decimal(10,2)");
                entity.Property(v => v.Placa).IsRequired().HasMaxLength(10);
                entity.Property(v => v.Cor).HasMaxLength(50);
                entity.Property(v => v.Disponivel).HasDefaultValue(true);
                entity.HasIndex(v => v.Placa).IsUnique();

                entity.HasOne(v => v.Fabricante)
                      .WithMany(f => f.Veiculos)
                      .HasForeignKey(v => v.FabricanteId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(v => v.Categoria)
                      .WithMany(c => c.Veiculos)
                      .HasForeignKey(v => v.CategoriaId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Nome).IsRequired().HasMaxLength(200);
                entity.Property(c => c.CPF).IsRequired().HasMaxLength(14);
                entity.Property(c => c.Email).IsRequired().HasMaxLength(200);
                entity.Property(c => c.Telefone).HasMaxLength(20);
                entity.Property(c => c.CNH).HasMaxLength(20);
                entity.Property(c => c.DataCadastro).HasDefaultValueSql("GETUTCDATE()");
                entity.HasIndex(c => c.CPF).IsUnique();
                entity.HasIndex(c => c.Email).IsUnique();
            });

            modelBuilder.Entity<Aluguel>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.DataInicio).IsRequired();
                entity.Property(a => a.DataFimPrevista).IsRequired();
                entity.Property(a => a.QuilometragemInicial).HasColumnType("decimal(10,2)");
                entity.Property(a => a.QuilometragemFinal).HasColumnType("decimal(10,2)");
                entity.Property(a => a.ValorDiaria).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(a => a.ValorTotal).HasColumnType("decimal(10,2)");
                entity.Property(a => a.Status).HasMaxLength(20).HasDefaultValue("Ativo");

                entity.HasOne(a => a.Cliente)
                      .WithMany(c => c.Alugueis)
                      .HasForeignKey(a => a.ClienteId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Veiculo)
                      .WithMany(v => v.Alugueis)
                      .HasForeignKey(a => a.VeiculoId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            SeedData(modelBuilder);
        }

        private static void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Fabricante>().HasData(
                new Fabricante { Id = 1, Nome = "Toyota", PaisOrigem = "Japão" },
                new Fabricante { Id = 2, Nome = "Volkswagen", PaisOrigem = "Alemanha" },
                new Fabricante { Id = 3, Nome = "Chevrolet", PaisOrigem = "Estados Unidos" },
                new Fabricante { Id = 4, Nome = "Honda", PaisOrigem = "Japão" },
                new Fabricante { Id = 5, Nome = "Hyundai", PaisOrigem = "Coreia do Sul" }
            );

            modelBuilder.Entity<Categoria>().HasData(
                new Categoria { Id = 1, Nome = "Econômico", Descricao = "Veículos compactos de baixo consumo.", ValorDiaria = 80.00m },
                new Categoria { Id = 2, Nome = "Intermediário", Descricao = "Veículos de médio porte e conforto.", ValorDiaria = 130.00m },
                new Categoria { Id = 3, Nome = "SUV", Descricao = "Utilitários esportivos com tração 4x4.", ValorDiaria = 250.00m },
                new Categoria { Id = 4, Nome = "Luxo", Descricao = "Veículos premium com alto nível de conforto.", ValorDiaria = 400.00m },
                new Categoria { Id = 5, Nome = "Pickup", Descricao = "Caminhonetes para uso urbano e rural.", ValorDiaria = 200.00m }
            );
        }
    }
}
