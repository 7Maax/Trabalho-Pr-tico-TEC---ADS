using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocadoraVeiculos.API.Data;
using LocadoraVeiculos.API.DTOs;
using LocadoraVeiculos.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly LocadoraContext _context;

        public CategoriasController(LocadoraContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaResponseDto>>> GetAll()
        {
            var categorias = await _context.Categorias
                .Select(c => new CategoriaResponseDto
                {
                    Id = c.Id,
                    Nome = c.Nome,
                    Descricao = c.Descricao,
                    ValorDiaria = c.ValorDiaria
                })
                .ToListAsync();

            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaResponseDto>> GetById(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null)
                return NotFound(new { mensagem = $"Categoria com ID {id} não encontrada." });

            return Ok(new CategoriaResponseDto
            {
                Id = categoria.Id,
                Nome = categoria.Nome,
                Descricao = categoria.Descricao,
                ValorDiaria = categoria.ValorDiaria
            });
        }

        [HttpPost]
        public async Task<ActionResult<CategoriaResponseDto>> Create([FromBody] CategoriaRequestDto dto)
        {
            if (await _context.Categorias.AnyAsync(c => c.Nome == dto.Nome))
                return Conflict(new { mensagem = $"Já existe uma categoria com o nome '{dto.Nome}'." });

            var categoria = new Categoria
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                ValorDiaria = dto.ValorDiaria
            };

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            var response = new CategoriaResponseDto
            {
                Id = categoria.Id,
                Nome = categoria.Nome,
                Descricao = categoria.Descricao,
                ValorDiaria = categoria.ValorDiaria
            };

            return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoriaRequestDto dto)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null)
                return NotFound(new { mensagem = $"Categoria com ID {id} não encontrada." });

            if (await _context.Categorias.AnyAsync(c => c.Nome == dto.Nome && c.Id != id))
                return Conflict(new { mensagem = $"Já existe outra categoria com o nome '{dto.Nome}'." });

            categoria.Nome = dto.Nome;
            categoria.Descricao = dto.Descricao;
            categoria.ValorDiaria = dto.ValorDiaria;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var categoria = await _context.Categorias
                .Include(c => c.Veiculos)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (categoria == null)
                return NotFound(new { mensagem = $"Categoria com ID {id} não encontrada." });

            if (categoria.Veiculos.Any())
                return BadRequest(new { mensagem = "Não é possível excluir uma categoria que possui veículos cadastrados." });

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
